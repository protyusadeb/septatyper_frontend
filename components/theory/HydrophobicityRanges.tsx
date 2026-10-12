// Combined mean hydrophobicity <H>GyrA-ParC of the QRDR helices, as reported in the manuscript (Table S5).
const MIN = 0.2, MAX = 0.55;
const x = (v: number) => 40 + ((v - MIN) / (MAX - MIN)) * 520;

export default function HydrophobicityRanges() {
  const bars = [
    { label: "Csus markers", from: 0.27, to: 0.32, color: "#2e9e6b" },
    { label: "Cres markers", from: 0.40, to: 0.48, color: "#c0392b" },
  ];
  return (
    <figure>
      <svg viewBox="0 0 600 150" role="img" className="w-full max-w-2xl"
        aria-label="Combined mean hydrophobicity ranges: susceptible markers 0.27 to 0.32, resistant markers 0.40 to 0.48, F-N-S-K 0.297">
        <line x1="40" y1="110" x2="560" y2="110" stroke="#94a3b8" />
        {[0.2, 0.3, 0.4, 0.5].map((t) => (
          <g key={t}><line x1={x(t)} y1="106" x2={x(t)} y2="114" stroke="#94a3b8" /><text x={x(t)} y="130" fontSize="11" textAnchor="middle" fill="#475569">{t.toFixed(1)}</text></g>
        ))}
        {bars.map((b, i) => (
          <g key={b.label}>
            <rect x={x(b.from)} y={30 + i * 32} width={x(b.to) - x(b.from)} height="20" rx="4" fill={b.color} opacity="0.85" />
            <text x={x(b.from) - 6} y={45 + i * 32} fontSize="12" textAnchor="end" fill="#334155">{b.label}</text>
            <text x={x(b.to) + 6} y={45 + i * 32} fontSize="11" fill="#475569">{b.from.toFixed(2)} to {b.to.toFixed(2)}</text>
          </g>
        ))}
        <circle cx={x(0.297)} cy="100" r="5" fill="#7b3fa0" />
        <text x={x(0.297) + 8} y="96" fontSize="11" fill="#7b3fa0">F-N-S-K 0.297 (resistant despite a susceptible-range value)</text>
      </svg>
      <figcaption className="mt-1 text-xs text-slate-500">
        Mean of the GyrA and ParC QRDR helix hydrophobicities, as reported in the manuscript. F-N-S-K is the exception, where positive
        charge rather than hydrophobicity impairs ParC binding.
      </figcaption>
    </figure>
  );
}
