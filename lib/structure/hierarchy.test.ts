import { parsePDB } from "molstar/lib/mol-io/reader/pdb/parser";
import { trajectoryFromPDB } from "molstar/lib/mol-model-formats/structure/pdb";
import { findMatchingChains, findIons, distanceToNearestIon } from "./hierarchy";

function atom(serial: number, name: string, res: string, chain: string, seq: number, x: number, y: number, z: number, el: string, het = false) {
  const rec = het ? "HETATM" : "ATOM  ";
  const nm = name.length < 4 ? " " + name.padEnd(3) : name;
  return `${rec}${String(serial).padStart(5)} ${nm} ${res.padStart(3)} ${chain}${String(seq).padStart(4)}    ${x.toFixed(3).padStart(8)}${y.toFixed(3).padStart(8)}${z.toFixed(3).padStart(8)}  1.00  0.00          ${el.padStart(2)}`;
}
const pdb = [
  // chain A: the right protein (Ser84 + Glu88)
  atom(1, "N", "SER", "A", 84, 0, 0, 0, "N"), atom(2, "CA", "SER", "A", 84, 1, 0, 0, "C"), atom(3, "O", "SER", "A", 84, 2, 0, 0, "O"), atom(4, "OG", "SER", "A", 84, 4, 0, 0, "O"),
  atom(5, "CA", "GLU", "A", 88, 0, 5, 0, "C"), atom(6, "OE1", "GLU", "A", 88, 0, 8, 0, "O"), atom(7, "OE2", "GLU", "A", 88, 0, 9, 0, "O"),
  // chain B: Ser84 present but residue 88 is LYS, so the chain must NOT match
  atom(8, "CA", "SER", "B", 84, 20, 0, 0, "C"), atom(9, "OG", "SER", "B", 84, 22, 0, 0, "O"), atom(10, "CA", "LYS", "B", 88, 20, 5, 0, "C"),
  atom(11, "MN", "MN", "A", 201, 8, 0, 0, "MN", true), atom(12, "MN", "MN", "A", 202, 0, 12, 0, "MN", true),
  "END",
].join("\n");

(async () => {
  const parsed = await parsePDB(pdb, "t").run();
  if (parsed.isError) throw new Error(parsed.message);
  const traj = await trajectoryFromPDB(parsed.result).run();
  const model = traj.representative;
  const reqs = [{ seqId: 84, compIds: ["SER"] }, { seqId: 88, compIds: ["GLU", "ASP"] }];
  const chains = findMatchingChains(model, reqs);
  const ions = findIons(model);
  const d84 = distanceToNearestIon(model, "A", 84, ions);
  const d88 = distanceToNearestIon(model, "A", 88, ions);
  const none = distanceToNearestIon(model, "A", 999, ions);
  console.log(JSON.stringify({ chains, ions: ions.map(i => `${i.compId}${i.seqId}@${i.chain}`), d84, d88, none }));
  const ok = chains.length === 1 && chains[0] === "A" && ions.length === 2 &&
    Math.abs(d84!.distance - 4) < 1e-6 && d84!.residueAtom === "OG" &&        // OG(4,0,0) to MN(8,0,0); backbone O ignored
    Math.abs(d88!.distance - 3) < 1e-6 && d88!.residueAtom === "OE2" && none === null; // OE2(0,9,0) to MN(0,12,0)
  console.log(ok ? "HIERARCHY TESTS PASS" : "HIERARCHY TESTS FAIL");
  process.exit(ok ? 0 : 1);
})();
