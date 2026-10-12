import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder";

/** Residue number `seqId` (author numbering) in any of the given author chain IDs. */
export const chainExpr = (chains: string[], seqId: number) =>
  MS.struct.generator.atomGroups({
    "chain-test": MS.core.set.has([MS.set(...chains), MS.ammp("auth_asym_id")]),
    "residue-test": MS.core.rel.eq([MS.ammp("auth_seq_id"), seqId]),
  });
