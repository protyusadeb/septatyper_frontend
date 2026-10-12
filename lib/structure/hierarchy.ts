// Pure data-level helpers on a parsed Mol* Model. No WebGL or DOM, so they can be unit tested in Node.
import type { Model } from "molstar/lib/mol-model/structure";

export interface ResidueRequirement {
  seqId: number;       // residue number in the model's own numbering (author numbering)
  compIds: string[];   // residue names accepted at that number, e.g. ["SER"]
}

export interface IonSite { seqId: number; compId: string; chain: string; x: number; y: number; z: number }

const ION_IDS = new Set(["MG", "MN"]); // Mg2+ in solution; Mn2+ is the usual crystallographic stand-in

function compOf(model: Model, r: number): string {
  const h = model.atomicHierarchy;
  return h.atoms.label_comp_id.value(h.residueAtomSegments.offsets[r]);
}

function residueChain(model: Model, r: number): string {
  const h = model.atomicHierarchy;
  return h.chains.auth_asym_id.value(h.chainAtomSegments.index[h.residueAtomSegments.offsets[r]]);
}

/** Chains that contain EVERY required residue with an accepted residue name. Protects against
 *  highlighting GyrB (or the wrong numbering) when a different PDB entry or numbering is configured. */
export function findMatchingChains(model: Model, reqs: ResidueRequirement[]): string[] {
  const { residues } = model.atomicHierarchy;
  const hits = new Map<string, Set<number>>();
  for (let r = 0; r < residues._rowCount; r++) {
    const seq = residues.auth_seq_id.value(r);
    const req = reqs.find((q) => q.seqId === seq);
    if (!req || !req.compIds.includes(compOf(model, r))) continue;
    const chain = residueChain(model, r);
    if (!hits.has(chain)) hits.set(chain, new Set());
    hits.get(chain)!.add(seq);
  }
  return [...hits.entries()].filter(([, s]) => s.size === reqs.length).map(([c]) => c).sort();
}

export function findIons(model: Model): IonSite[] {
  const h = model.atomicHierarchy;
  const { x, y, z } = model.atomicConformation;
  const out: IonSite[] = [];
  for (let r = 0; r < h.residues._rowCount; r++) {
    const comp = compOf(model, r);
    if (!ION_IDS.has(comp)) continue;
    const a = h.residueAtomSegments.offsets[r];
    out.push({ seqId: h.residues.auth_seq_id.value(r), compId: comp, chain: residueChain(model, r), x: x[a], y: y[a], z: z[a] });
  }
  return out;
}

export interface IonDistance { residueAtom: string; ion: string; distance: number }

/** Shortest distance from a residue's side-chain oxygen atoms to any Mg/Mn ion in the model. */
export function distanceToNearestIon(model: Model, chain: string, seqId: number, ions: IonSite[]): IonDistance | null {
  const h = model.atomicHierarchy;
  const { x, y, z } = model.atomicConformation;
  let best: IonDistance | null = null;
  for (let r = 0; r < h.residues._rowCount; r++) {
    if (h.residues.auth_seq_id.value(r) !== seqId || residueChain(model, r) !== chain) continue;
    for (let a = h.residueAtomSegments.offsets[r]; a < h.residueAtomSegments.offsets[r + 1]; a++) {
      const name = h.atoms.label_atom_id.value(a);
      if (h.atoms.type_symbol.value(a) !== "O" || name === "O" || name === "OXT") continue; // side chain only
      for (const ion of ions) {
        const d = Math.hypot(x[a] - ion.x, y[a] - ion.y, z[a] - ion.z);
        if (best === null || d < best.distance) best = { residueAtom: name, ion: `${ion.compId}${ion.seqId}`, distance: d };
      }
    }
  }
  return best;
}
