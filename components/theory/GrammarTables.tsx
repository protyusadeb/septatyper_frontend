const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide";
const td = "px-3 py-2.5 align-top";

export function Tier1Table() {
  const rows: [string, string, string][] = [
    ["GyrA-83", "Polar residue with -OH group (Ser)", "Hydrophobic residue (Ile, Leu, Phe)"],
    ["GyrA-87", "Negatively charged residue (Asp)", "Polar or uncharged residue (Asn, Gly)"],
    ["ParC-80", "Polar residue with -OH group (Ser)", "Hydrophobic residue (Ile)"],
    ["ParC-84", "Negatively charged residue (Glu)", "Uncharged residue, or Glu next to a hydrophobic ParC-80"],
  ];
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-blue-950 text-blue-50">
          <tr><th className={th}>Position</th><th className={th}>Susceptible state</th><th className={th}>Resistant state</th></tr>
        </thead>
        <tbody>
          {rows.map(([p, s, r]) => (
            <tr key={p} className="border-b border-slate-100">
              <td className={`${td} font-medium`}>{p}</td>
              <td className={`${td} text-emerald-800`}>{s}</td>
              <td className={`${td} text-red-800`}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tier2Table() {
  const rows: [string, string, string][] = [
    ["qnr present", "Any species. Baseline Susceptible and qnrB2 or qnrS1 (family level) detected.", "Resistant"],
    ["S. sonnei RecN L346F", "Shigella sonnei, baseline S-D-S-E, RecN-346 is Phe.", "Resistant"],
    ["S. enterica RecN codon", "Salmonella enterica, baseline F-D-S-E, RecN-346 uses the ctg codon (not cta).", "Resistant"],
    ["S. sonnei single vote", "Shigella sonnei, baseline L-D-S-E or S-Y-S-E.", "Resistant"],
  ];
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-blue-950 text-blue-50">
          <tr><th className={th}>Override</th><th className={th}>Condition</th><th className={th}>Final call</th></tr>
        </thead>
        <tbody>
          {rows.map(([n, c, f]) => (
            <tr key={n} className="border-b border-slate-100">
              <td className={`${td} font-medium`}>{n}</td><td className={td}>{c}</td>
              <td className={`${td} font-medium text-red-700`}>{f}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
