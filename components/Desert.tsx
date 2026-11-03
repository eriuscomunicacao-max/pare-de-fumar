// Paisagem do deserto ao entardecer, em SVG (sem imagem externa).
export default function Desert({ className = '', glow = 0.5 }: { className?: string; glow?: number }) {
  const stars = Array.from({ length: 34 }, (_, i) => ({
    x: (i * 137) % 400,
    y: (i * 59) % 150,
    r: i % 5 === 0 ? 1.4 : 0.8,
  }))
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1018" />
          <stop offset="0.45" stopColor="#2a2430" />
          <stop offset="0.72" stopColor="#8a4a2c" />
          <stop offset="1" stopColor="#e0963f" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="1" />
          <stop offset="0.35" stopColor="#f2b556" stopOpacity={0.9 * glow + 0.1} />
          <stop offset="1" stopColor="#e0963f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2418" />
          <stop offset="1" stopColor="#0e1512" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f3ece0" opacity={0.7} />
      ))}
      <circle cx="270" cy="188" r="64" fill="url(#sun)" />
      <path d="M0 200 L40 176 L84 196 L130 160 L176 192 L230 170 L290 198 L340 168 L400 196 L400 300 L0 300Z" fill="#4a2c20" opacity="0.85" />
      <path d="M0 232 Q70 200 150 224 T300 220 T400 214 L400 300 L0 300Z" fill="url(#dune)" />
      <path d="M0 262 Q90 238 190 258 T400 250 L400 300 L0 300Z" fill="#0e1512" />
      {/* cactos */}
      <g fill="#0b110e">
        <path d="M44 270 V222 q0-7 6-7 t6 7 V270Z M44 244 q-14 0-14-12 v-8 q0-5 5-5 t5 5 v8 q0 4 4 4Z M56 238 q14 0 14-12 v-10 q0-5-5-5 t-5 5 v10 q0 4-4 4Z" />
        <path d="M346 276 V240 q0-6 5-6 t5 6 V276Z M346 256 q-11 0-11-9 v-6 q0-4 4-4 t4 4 v6 q0 3 3 3Z" />
      </g>
    </svg>
  )
}
