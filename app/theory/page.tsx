import { Tier1Table, Tier2Table } from "@/components/theory/GrammarTables";
import HydrophobicityRanges from "@/components/theory/HydrophobicityRanges";
import MechanismCards from "@/components/theory/MechanismCards";
import StructuralExplorer from "@/components/theory/StructuralExplorer";
import ValidationDashboard from "@/components/theory/ValidationDashboard";

export const metadata = {
  title: "Context-dependent grammar | SeptaTyper",
  description: "How combinations of GyrA, ParC and RecN residues and PMQR genes determine ciprofloxacin resistance.",
};

const NAV = [
  ["grammar", "Two-tier grammar"], ["mechanisms", "Mechanisms"], ["hydrophobicity", "Hydrophobicity"],
  ["overrides", "Tier 2 overrides"], ["structure", "3D explorer"], ["validation", "Validation"],
];

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-blue-950">{title}</h2>
        {intro && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-700">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export default function TheoryPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-800">Physicochemical syntax engine</p>
        <h1 className="text-3xl font-semibold text-blue-950">Context-dependent grammar of ciprofloxacin resistance</h1>
        <p className="max-w-3xl text-base leading-relaxed text-slate-700">
          Resistance does not follow from a single mutation. The effect of a residue depends on its neighbours: the same Glu at ParC-84
          is susceptible beside a polar Ser80 and resistant beside a hydrophobic Ile80. SeptaTyper reads the residues at GyrA-83,
          GyrA-87, ParC-80 and ParC-84 as a combination, the tetratype, and then adds RecN-346 and two plasmid-borne qnr gene
          families to form the septatype.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-1">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:border-blue-500 hover:text-blue-900">{label}</a>
          ))}
        </nav>
      </header>

      <Section id="grammar" title="The two-tier grammar"
        intro="Tier 1 reads the tetratype and sets a physicochemical baseline. Tier 2 can only upgrade a susceptible baseline to resistant, using evidence from outside the four target residues.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-800">Tier 1</div>
            <h3 className="text-base font-semibold text-blue-950">Tetratype baseline</h3>
            <p className="mt-1 text-sm text-slate-700">
              Each position casts a vote toward resistance when it loses its native hydroxyl or negative charge. Two or more votes give a
              resistant baseline, none gives a susceptible one, and a single vote is settled by the hydrophobicity of the helices.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-800">Tier 2</div>
            <h3 className="text-base font-semibold text-blue-950">Septatype overrides</h3>
            <p className="mt-1 text-sm text-slate-700">
              qnr genes, selected RecN-346 states and species-specific patterns can overturn a susceptible baseline. They never turn a
              resistant baseline back into a susceptible one.
            </p>
          </div>
        </div>
        <Tier1Table />
        <p className="max-w-3xl text-sm text-slate-600">
          The ParC-84 row is the cooperative part of the grammar. Glu84 keeps the water-metal ion bridge intact when ParC-80 is a polar
          Ser (the S-E state) and disrupts it when ParC-80 is a hydrophobic Ile (the I-E state), so the residue alone does not decide the call.
        </p>
      </Section>

      <Section id="mechanisms" title="Mechanisms" intro="Three patterns recur across the 2,734 isolates in the repository.">
        <MechanismCards />
      </Section>

      <Section id="hydrophobicity" title="Combined mean hydrophobicity"
        intro="For each of GyrA and ParC, the mean hydrophobicity of the quinolone resistance-determining region helix is calculated on the Eisenberg consensus scale, and the combined value ⟨H⟩ GyrA-ParC is the average of the two. Across the repository, helices carrying susceptible markers fall between 0.27 and 0.32, and helices carrying resistant markers between 0.40 and 0.48. This separation is the theoretical underpinning of the grammar.">
        <HydrophobicityRanges />
      </Section>

      <Section id="overrides" title="Tier 2 overrides" intro="Applied only when the Tier 1 baseline is Susceptible.">
        <Tier2Table />
      </Section>

      <Section id="structure" title="Interactive structural explorer"
        intro="Choose a tetratype to see which positions lose their hydrogen bond, lose their negative charge, or reverse it, and how that bears on the Mg²⁺ water bridge. GyrA belongs to DNA gyrase and ParC to topoisomerase IV, so each has its own reference structure.">
        <StructuralExplorer />
        <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
          These mechanisms are a structural interpretation of sequence and phenotype patterns. The viewer illustrates them on
          wild-type crystal structures of related bacteria, mapped to E. coli numbering, and does not simulate the variants.
        </p>
      </Section>

      <Section id="validation" title="Performance validation" intro="How the grammar performs against laboratory phenotypes in the repository.">
        <ValidationDashboard />
      </Section>

      <footer className="space-y-1 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <p>Eisenberg, D., Schwarz, E., Komaromy, M. &amp; Wall, R. J. Mol. Biol. 179, 125–142 (1984).</p>
        <p>Wohlkonig, A. et al. Nat. Struct. Mol. Biol. 17, 1152–1153 (2010).</p>
        <p>PDB 2XCT: Bax, B. D. et al. Nature (2010), doi:10.1038/nature09197. PDB 3FOF: Laponogov, I. et al. Nat. Struct. Mol. Biol. 16, 667–669 (2009).</p>
      </footer>
    </main>
  );
}
