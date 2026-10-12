/* eslint-disable @typescript-eslint/no-explicit-any */
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { chainExpr } from "./queries";

function atom(serial: number, name: string, res: string, chain: string, seq: number, x: number, y: number, z: number, el: string, het = false) {
  const rec = het ? "HETATM" : "ATOM  ";
  const nm = name.length < 4 ? " " + name.padEnd(3) : name;
  return `${rec}${String(serial).padStart(5)} ${nm} ${res.padStart(3)} ${chain}${String(seq).padStart(4)}    ${x.toFixed(3).padStart(8)}${y.toFixed(3).padStart(8)}${z.toFixed(3).padStart(8)}  1.00  0.00          ${el.padStart(2)}`;
}
const pdb = [
  atom(1, "N", "SER", "A", 84, 0, 0, 0, "N"), atom(2, "CA", "SER", "A", 84, 1, 0, 0, "C"), atom(3, "O", "SER", "A", 84, 2, 0, 0, "O"), atom(4, "OG", "SER", "A", 84, 4, 0, 0, "O"),
  atom(5, "CA", "GLU", "A", 88, 0, 5, 0, "C"), atom(6, "OE1", "GLU", "A", 88, 0, 8, 0, "O"),
  atom(8, "CA", "SER", "B", 84, 20, 0, 0, "C"), atom(9, "OG", "SER", "B", 84, 22, 0, 0, "O"),
  atom(11, "MN", "MN", "A", 201, 8, 0, 0, "MN", true), "END",
].join("\n");

(async () => {
  const plugin = new PluginContext(DefaultPluginSpec());
  await plugin.init();
  const data = await plugin.builders.data.rawData({ data: pdb, label: "t" });
  const traj = await plugin.builders.structure.parseTrajectory(data, "pdb");
  const model = await plugin.builders.structure.createModel(traj);
  const structure = await plugin.builders.structure.createStructure(model);
  const expr = chainExpr;
  const a = await plugin.builders.structure.tryCreateComponentFromExpression(structure.ref, expr(["A"], 84), "r1", { label: "x" });
  const b = await plugin.builders.structure.tryCreateComponentFromExpression(structure.ref, expr(["A", "B"], 84), "r2", { label: "y" });
  const none = await plugin.builders.structure.tryCreateComponentFromExpression(structure.ref, expr(["Z"], 84), "r3", { label: "z" });
  const ion = await plugin.builders.structure.tryCreateComponentStatic(structure, "ion");
  const protein = await plugin.builders.structure.tryCreateComponentStatic(structure, "protein");
  // representations: same parameter shapes the viewer uses
  const { Color } = await import("molstar/lib/mol-util/color");
  const reps: Record<string, string> = {};
  const tryRep = async (name: string, comp: any, params: any) => {
    try { const r = await plugin.builders.structure.representation.addRepresentation(comp, params); reps[name] = r ? "ok" : "null"; }
    catch (e: any) { reps[name] = "ERR " + (e?.message ?? e); }
  };
  await tryRep("cartoon", protein, { type: "cartoon", color: "uniform", colorParams: { value: Color(0xcbd5e1) }, typeParams: { alpha: 0.45 } });
  await tryRep("ballstick", a, { type: "ball-and-stick", color: "uniform", colorParams: { value: Color(0xc0392b) }, typeParams: { sizeFactor: 0.35 } });
  await tryRep("label", a, { type: "label", typeParams: { level: "residue" }, color: "uniform", colorParams: { value: Color(0xc0392b) } });
  await tryRep("spacefill", ion, { type: "spacefill", color: "element-symbol", typeParams: { sizeFactor: 0.6 } });
  console.log(JSON.stringify(reps));
  const n = (c: any) => c?.data?.elementCount;
  console.log(JSON.stringify({ chainA_ser84: n(a), chainsAB_ser84: n(b), wrongChain: n(none), ion: n(ion), protein: n(protein) }));
  const ok = n(a) === 4 && n(b) === 6 && (n(none) === 0 || n(none) === undefined) && n(ion) === 1 && n(protein) === 8;
  console.log(ok ? "EXPRESSION TESTS PASS" : "EXPRESSION TESTS FAIL");
  plugin.dispose();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error("ERR", e?.message ?? e); process.exit(2); });
