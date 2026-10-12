import type { PositionKey } from "../structure/config";

/** How a position changes relative to the susceptible state. Drives colours and the side panel. */
export type EffectKind = "intact" | "lost_hbond" | "neutralised" | "reversed" | "context";

export const EFFECT_STYLE: Record<EffectKind, { label: string; hex: number; css: string }> = {
  intact:      { label: "Native interaction kept",         hex: 0x2e9e6b, css: "#2e9e6b" },
  lost_hbond:  { label: "Hydroxyl H-bond lost",            hex: 0xc0392b, css: "#c0392b" },
  neutralised: { label: "Negative charge lost",            hex: 0xe67e22, css: "#e67e22" },
  reversed:    { label: "Charge reversed (positive)",      hex: 0x7b3fa0, css: "#7b3fa0" },
  context:     { label: "Kept, but its environment changed", hex: 0xd4a017, css: "#d4a017" },
};

export interface PositionEffect {
  key: PositionKey;
  label: string;      // GyrA-83
  from: string;       // wild-type residue (three-letter)
  to: string;         // residue in this tetratype
  kind: EffectKind;
  text: string;
}

export interface Scenario {
  id: string;
  tetratype: string;
  phenotype: "Susceptible" | "Resistant";
  button: string;
  title: string;
  summary: string;
  bridge: { status: "intact" | "disrupted"; text: string };
  effects: PositionEffect[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "sdse",
    tetratype: "S-D-S-E",
    phenotype: "Susceptible",
    button: "Show Susceptible S-D-S-E",
    title: "Susceptible state: S-D-S-E",
    summary:
      "The hydroxyl groups of Ser83 (GyrA) and Ser80 (ParC), together with the negative charges of Asp87 (GyrA) and Glu84 (ParC), maintain the local electrostatic environment around the drug-bound Mg²⁺.",
    bridge: {
      status: "intact",
      text: "The water-metal ion bridge forms. Mg²⁺ is held in octahedral coordination by four waters, whose hydrogen bonds to the helix residues anchor the ciprofloxacin-Mg²⁺ complex, so the drug binds.",
    },
    effects: [
      { key: "gyrA83", label: "GyrA-83", from: "Ser", to: "Ser", kind: "intact", text: "Hydroxyl available for water-mediated hydrogen bonding." },
      { key: "gyrA87", label: "GyrA-87", from: "Asp", to: "Asp", kind: "intact", text: "Negative charge supports the electrostatic environment." },
      { key: "parC80", label: "ParC-80", from: "Ser", to: "Ser", kind: "intact", text: "Hydroxyl available for water-mediated hydrogen bonding." },
      { key: "parC84", label: "ParC-84", from: "Glu", to: "Glu", kind: "intact", text: "Negative charge next to a polar Ser80 keeps the bridge environment (the S-E state)." },
    ],
  },
  {
    id: "inie",
    tetratype: "I-N-I-E",
    phenotype: "Resistant",
    button: "Show Resistant I-N-I-E",
    title: "Hydrophobic disruption: I-N-I-E",
    summary:
      "Ser83 and Ser80 are replaced by hydrophobic Ile, which removes the native hydrogen bonding. Asp87 is replaced by neutral Asn, which changes the electrostatic environment. Glu84 stays, but now sits beside a hydrophobic Ile80 (the I-E state).",
    bridge: {
      status: "disrupted",
      text: "Hydroxyl hydrogen bonds are lost at both enzymes and the negative charge at GyrA-87 is gone, so the water-metal ion bridge cannot form as in the susceptible state and drug binding is prevented.",
    },
    effects: [
      { key: "gyrA83", label: "GyrA-83", from: "Ser", to: "Ile", kind: "lost_hbond", text: "Ser to Ile removes the hydroxyl and adds hydrophobicity." },
      { key: "gyrA87", label: "GyrA-87", from: "Asp", to: "Asn", kind: "neutralised", text: "Asp to Asn leaves a polar but uncharged side chain." },
      { key: "parC80", label: "ParC-80", from: "Ser", to: "Ile", kind: "lost_hbond", text: "Ser to Ile removes the hydroxyl involved in water-mediated interactions." },
      { key: "parC84", label: "ParC-84", from: "Glu", to: "Glu", kind: "context", text: "Glu is kept, but beside a hydrophobic residue it no longer works as in S-E." },
    ],
  },
  {
    id: "fnsk",
    tetratype: "F-N-S-K",
    phenotype: "Resistant",
    button: "Show Resistant F-N-S-K",
    title: "Electrostatic reversal: F-N-S-K",
    summary:
      "Replacing Glu84 with Lys84 introduces a positive charge and reverses the local electrostatic environment around Mg²⁺. ParC Ser80 is kept, so hydrogen-bonding capacity is retained there, yet resistance is not driven by hydrophobicity at this position.",
    bridge: {
      status: "disrupted",
      text: "The charge reversal at ParC-84 alters the charge distribution around the Mg²⁺ ion that the water-metal ion bridge relies on, disrupting the coordination the drug-target complex needs. GyrA carries the F-N hydrophobic and neutral changes.",
    },
    effects: [
      { key: "gyrA83", label: "GyrA-83", from: "Ser", to: "Phe", kind: "lost_hbond", text: "Ser to Phe removes the hydroxyl and adds hydrophobicity." },
      { key: "gyrA87", label: "GyrA-87", from: "Asp", to: "Asn", kind: "neutralised", text: "Asp to Asn leaves a polar but uncharged side chain." },
      { key: "parC80", label: "ParC-80", from: "Ser", to: "Ser", kind: "intact", text: "Hydroxyl retained, so hydrogen bonding capacity is preserved." },
      { key: "parC84", label: "ParC-84", from: "Glu", to: "Lys", kind: "reversed", text: "Glu to Lys turns a negative charge into a positive one." },
    ],
  },
];
