// Reference structures for the Module D viewer.
//
// GyrA and ParC belong to different enzymes (DNA gyrase and topoisomerase IV), so no single PDB
// entry holds both. The viewer therefore uses two fluoroquinolone-bound complexes. Neither is E. coli,
// so residue numbers are mapped to the E. coli numbering used throughout SeptaTyper. Every mapping is
// checked at load time against the residue names listed here; a mismatch shows a visible warning
// instead of silently highlighting the wrong residue.
//
// To use your own model (for example an E. coli structure), set the *_MODEL_URL env variables to a
// file served from /public/models and edit seqId / compIds below.

export type PositionKey = "gyrA83" | "gyrA87" | "parC80" | "parC84";
export type EnzymeKey = "gyrase" | "topoIV";

export interface ModelPosition {
  key: PositionKey;
  label: string;          // E. coli numbering, as used in septatypes
  ecoliResidue: string;   // wild-type residue in E. coli
  seqId: number;          // residue number in THIS model
  compIds: string[];      // residue names accepted at that number
  modelResidue: string;   // for the legend, e.g. "Ser84"
}

export interface ModelConfig {
  key: EnzymeKey;
  title: string;
  protein: string;
  organism: string;
  pdbId: string;
  drug: string;
  resolution: string;
  url: string;
  format: "mmcif" | "pdb";
  positions: ModelPosition[];
  note: string;
}

const override = (envValue: string | undefined, pdbId: string) =>
  envValue ? { url: envValue, format: (envValue.toLowerCase().endsWith(".pdb") ? "pdb" : "mmcif") as "pdb" | "mmcif" }
           : { url: `https://files.rcsb.org/download/${pdbId}.cif`, format: "mmcif" as const };

export const MODELS: Record<EnzymeKey, ModelConfig> = {
  gyrase: {
    key: "gyrase",
    title: "GyrA, DNA gyrase",
    protein: "GyrA (gyrase)",
    organism: "Staphylococcus aureus",
    pdbId: "2XCT",
    drug: "ciprofloxacin",
    resolution: "3.35 Å, twinned crystal, Mn²⁺ in place of Mg²⁺",
    ...override(process.env.NEXT_PUBLIC_GYRASE_MODEL_URL, "2XCT"),
    positions: [
      { key: "gyrA83", label: "GyrA-83", ecoliResidue: "Ser", seqId: 84, compIds: ["SER"], modelResidue: "Ser84" },
      { key: "gyrA87", label: "GyrA-87", ecoliResidue: "Asp", seqId: 88, compIds: ["GLU", "ASP"], modelResidue: "Glu88" },
    ],
    note: "S. aureus GyrA Ser84 and Glu88 are the equivalents of E. coli Ser83 and Asp87. The negative charge is conserved.",
  },
  topoIV: {
    key: "topoIV",
    title: "ParC, topoisomerase IV",
    protein: "ParC (topo IV)",
    organism: "Streptococcus pneumoniae",
    pdbId: "3FOF",
    drug: "moxifloxacin",
    resolution: "crystal structure of the ParC breakage-reunion domain with DNA",
    ...override(process.env.NEXT_PUBLIC_TOPOIV_MODEL_URL, "3FOF"),
    positions: [
      { key: "parC80", label: "ParC-80", ecoliResidue: "Ser", seqId: 79, compIds: ["SER"], modelResidue: "Ser79" },
      { key: "parC84", label: "ParC-84", ecoliResidue: "Glu", seqId: 83, compIds: ["ASP", "GLU"], modelResidue: "Asp83" },
    ],
    note: "S. pneumoniae ParC Ser79 and Asp83 are the equivalents of E. coli Ser80 and Glu84. The negative charge is conserved.",
  },
};

export const ENZYME_FOR_POSITION: Record<PositionKey, EnzymeKey> = {
  gyrA83: "gyrase", gyrA87: "gyrase", parC80: "topoIV", parC84: "topoIV",
};
