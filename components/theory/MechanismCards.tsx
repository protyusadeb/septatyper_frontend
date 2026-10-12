const CARDS = [
  {
    tag: "Susceptible state", example: "S-D-S-E", tone: "border-emerald-200 bg-emerald-50", head: "text-emerald-900",
    body: "The polar hydroxyl (-OH) groups of GyrA-83 (Ser) and ParC-80 (Ser), combined with the negative charges of GyrA-87 (Asp) and ParC-84 (Glu), maintain the local electrostatic environment. This facilitates the water-metal ion bridge that coordinates the Mg²⁺ ion, allowing ciprofloxacin to bind successfully.",
  },
  {
    tag: "Hydrophobic disruption", example: "I-N-I-E, L-G-I-E", tone: "border-red-200 bg-red-50", head: "text-red-900",
    body: "Replacing Ser83 or Ser80 with hydrophobic residues (Ile, Leu, Phe) abolishes native hydrogen bonding. Replacing Asp87 with charge-neutral amino acids (Asn, Gly) alters the electrostatic environment, preventing drug binding.",
  },
  {
    tag: "Electrostatic reversal", example: "F-N-S-K", tone: "border-violet-200 bg-violet-50", head: "text-violet-900",
    body: "Replacing Glu84 with Lys84 introduces a positive charge. This reverses the local electrostatic environment surrounding the Mg²⁺ ion, disrupting the coordination necessary for the drug-target complex despite maintaining ParC-80's hydrogen-bonding capacity.",
  },
];

export default function MechanismCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CARDS.map((c) => (
        <article key={c.tag} className={`rounded-lg border p-4 ${c.tone}`}>
          <h3 className={`text-base font-semibold ${c.head}`}>{c.tag}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate-600">e.g. {c.example}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.body}</p>
        </article>
      ))}
    </div>
  );
}
