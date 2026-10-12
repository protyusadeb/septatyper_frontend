"use client";
// Browser-only. Import it with next/dynamic({ ssr: false }), as StructuralExplorer does.
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { useEffect, useRef } from "react";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { DefaultPluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import type { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder";
import { Script } from "molstar/lib/mol-script/script";
import { StructureSelection } from "molstar/lib/mol-model/structure";
import type { Structure } from "molstar/lib/mol-model/structure";
import { Color } from "molstar/lib/mol-util/color";
import type { ModelConfig, PositionKey } from "@/lib/structure/config";
import { EFFECT_STYLE, type EffectKind } from "@/lib/theory/scenarios";
import { distanceToNearestIon, findIons, findMatchingChains } from "@/lib/structure/hierarchy";
import { chainExpr } from "@/lib/structure/queries";

export interface ViewerReport {
  state: "loading" | "ready" | "error";
  message?: string;
  chains: string[];
  ionCount: number;
  issues: string[];
  distances: Partial<Record<PositionKey, { residueAtom: string; ion: string; distance: number }>>;
}

interface Props {
  model: ModelConfig;
  /** Effect of the selected tetratype at each of this enzyme's positions (null = neutral grey). */
  effects: Partial<Record<PositionKey, EffectKind>> | null;
  onReport: (r: ViewerReport) => void;
}

interface Loaded {
  structure: { ref: string };
  data: Structure;
  chains: string[];
  residueRefs: string[];
}

const GREY = Color(0xcbd5e1);
const DNA = Color(0xf3d9b1);
const NEUTRAL = Color(0x94a3b8);

async function drawResidues(
  plugin: PluginUIContext,
  loaded: Loaded,
  model: ModelConfig,
  effects: Props["effects"],
  refocus: boolean,
) {
  // remove the previous residue components, then add one per position
  if (loaded.residueRefs.length) {
    const b = plugin.state.data.build();
    loaded.residueRefs.forEach((r) => b.delete(r));
    await b.commit();
    loaded.residueRefs = [];
  }
  if (loaded.chains.length === 0) return;
  for (const pos of model.positions) {
    const kind = effects?.[pos.key];
    const color = kind ? Color(EFFECT_STYLE[kind].hex) : NEUTRAL;
    const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
      loaded.structure.ref,
      chainExpr(loaded.chains, pos.seqId),
      `residue-${pos.key}`,
      { label: `${pos.label} (${pos.modelResidue})` },
    );
    if (!comp) continue;
    loaded.residueRefs.push(comp.ref);
    await plugin.builders.structure.representation.addRepresentation(comp, {
      type: "ball-and-stick",
      color: "uniform",
      colorParams: { value: color },
      typeParams: { sizeFactor: 0.35 },
    });
    try {
      await plugin.builders.structure.representation.addRepresentation(comp, {
        type: "label",
        typeParams: { level: "residue" },
        color: "uniform",
        colorParams: { value: color },
      });
    } catch {
      /* labels are a nicety; the legend in the side panel carries the same information */
    }
  }
  if (refocus) {
    const all = MS.struct.combinator.merge(model.positions.map((p) => chainExpr(loaded.chains, p.seqId)));
    const loci = StructureSelection.toLociWithSourceUnits(Script.getStructureSelection(all, loaded.data));
    plugin.managers.camera.focusLoci(loci, { durationMs: 500, extraRadius: 12 });
  }
}

export default function MolstarViewer({ model, effects, onReport }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<PluginUIContext | null>(null);
  const loadedRef = useRef<Loaded | null>(null);
  const reportRef = useRef(onReport);
  const effectsRef = useRef(effects);
  const drawing = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    reportRef.current = onReport;
    effectsRef.current = effects;
  });

  // Load the structure whenever the enzyme (model) changes.
  useEffect(() => {
    let cancelled = false;
    const mount = document.createElement("div");
    mount.style.cssText = "position:absolute;inset:0";
    host.current?.appendChild(mount);
    const base: ViewerReport = { state: "loading", chains: [], ionCount: 0, issues: [], distances: {} };
    reportRef.current(base);

    (async () => {
      let plugin: PluginUIContext | null = null;
      try {
        const spec = DefaultPluginUISpec();
        spec.layout = { initial: { isExpanded: false, showControls: false } };
        spec.components = { ...spec.components, remoteState: "none" };
        plugin = await createPluginUI({ target: mount, render: renderReact18, spec });
        if (cancelled) { plugin.dispose(); return; }
        pluginRef.current = plugin;

        const data = await plugin.builders.data.download({ url: model.url, isBinary: false }, { state: { isGhost: true } });
        const trajectory = await plugin.builders.structure.parseTrajectory(data, model.format);
        const mdl = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(mdl);
        const struct = structure.data as Structure;
        if (cancelled) return;

        // 1. Check the numbering assumptions against the real file.
        const issues: string[] = [];
        const chains = findMatchingChains(
          struct.model,
          model.positions.map((p) => ({ seqId: p.seqId, compIds: p.compIds })),
        );
        if (chains.length === 0) {
          issues.push(
            `No chain in ${model.pdbId} has ${model.positions.map((p) => `${p.compIds.join("/")} at ${p.seqId}`).join(" and ")}. ` +
            "Check the residue mapping in lib/structure/config.ts. Residues are not highlighted.",
          );
        }
        const ions = findIons(struct.model);
        if (ions.length === 0) issues.push(`No Mg or Mn ion found in ${model.pdbId}.`);

        // 2. Measured distances from each side chain to the nearest metal ion (model data, not a prediction).
        const distances: ViewerReport["distances"] = {};
        if (chains.length && ions.length) {
          for (const p of model.positions) {
            const d = distanceToNearestIon(struct.model, chains[0], p.seqId, ions);
            if (d) distances[p.key] = d;
          }
        }

        // 3. Scene: faded protein and DNA, drug, metal ions, then the residues of interest.
        const protein = await plugin.builders.structure.tryCreateComponentStatic(structure, "protein");
        if (protein) {
          await plugin.builders.structure.representation.addRepresentation(protein, {
            type: "cartoon", color: "uniform", colorParams: { value: GREY }, typeParams: { alpha: 0.45 },
          });
        }
        const nucleic = await plugin.builders.structure.tryCreateComponentStatic(structure, "nucleic");
        if (nucleic) {
          await plugin.builders.structure.representation.addRepresentation(nucleic, {
            type: "cartoon", color: "uniform", colorParams: { value: DNA }, typeParams: { alpha: 0.5 },
          });
        }
        const ligand = await plugin.builders.structure.tryCreateComponentStatic(structure, "ligand");
        if (ligand) {
          await plugin.builders.structure.representation.addRepresentation(ligand, {
            type: "ball-and-stick", color: "element-symbol", typeParams: { sizeFactor: 0.3 },
          });
        }
        const ion = await plugin.builders.structure.tryCreateComponentStatic(structure, "ion");
        if (ion) {
          await plugin.builders.structure.representation.addRepresentation(ion, {
            type: "spacefill", color: "element-symbol", typeParams: { sizeFactor: 0.6 },
          });
        }

        loadedRef.current = { structure: { ref: structure.ref }, data: struct, chains, residueRefs: [] };
        await drawResidues(plugin, loadedRef.current, model, effectsRef.current, true);
        if (cancelled) return;
        reportRef.current({ state: "ready", chains, ionCount: ions.length, issues, distances });
      } catch (err) {
        if (!cancelled) {
          reportRef.current({
            ...base, state: "error",
            message: err instanceof Error ? err.message : "The structure could not be loaded.",
          });
        }
        if (plugin && cancelled) plugin.dispose();
      }
    })();

    return () => {
      cancelled = true;
      loadedRef.current = null;
      pluginRef.current?.dispose();
      pluginRef.current = null;
      mount.remove();
    };
  }, [model]);

  // Recolour residues when the selected tetratype changes (no reload).
  useEffect(() => {
    const plugin = pluginRef.current;
    const loaded = loadedRef.current;
    if (!plugin || !loaded) return;
    drawing.current = drawResidues(plugin, loaded, model, effects, false).catch(() => undefined);
  }, [effects, model]);

  return <div ref={host} className="relative h-full w-full" aria-label={`3D structure of ${model.title}`} />;
}
