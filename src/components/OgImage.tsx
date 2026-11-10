// Layout for generated share images (next/og). Satori only understands inline styles and a
// subset of CSS, so no Tailwind here; colours mirror the tokens in globals.css (the family look:
// night, indigo light and the ring mark).
// DECISION: next/og's built-in sans font. The self-hosted fonts are WOFF2, which next/og can't
// read, and bundling extra font files into the server function isn't worth it for share cards.

export const OG_SIZE = { width: 1200, height: 630 }

const rings = [250, 190, 130, 70]

export function OgCard({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: '#0a0a0c',
        backgroundImage:
          'radial-gradient(circle at 18% 22%, rgba(83, 74, 183, 0.55), rgba(10, 10, 12, 0) 55%), radial-gradient(circle at 85% 90%, rgba(61, 53, 138, 0.6), rgba(10, 10, 12, 0) 50%)',
        color: '#ffffff',
      }}
    >
      <svg
        width="620"
        height="620"
        viewBox="0 0 620 620"
        style={{ position: 'absolute', right: -150, top: 5 }}
      >
        {rings.map((r, i) => (
          <circle
            key={r}
            cx="310"
            cy="310"
            r={r}
            fill="none"
            stroke="#9b95d8"
            strokeWidth="2"
            opacity={0.18 + i * 0.12}
          />
        ))}
        <circle cx="310" cy="310" r="14" fill="#9b95d8" />
      </svg>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          padding: '72px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#9b95d8',
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            maxWidth: 900,
            fontSize: title.length > 60 ? 62 : 76,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28 }}>
          <span style={{ fontWeight: 800 }}>EthicAI</span>
          <span style={{ color: '#a1a1a6' }}>EthicAI · Selma</span>
        </div>
      </div>
    </div>
  )
}
