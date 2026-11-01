// Layout for generated share images (next/og). Satori only understands inline styles and a
// subset of CSS, so no Tailwind here; colours mirror the tokens in globals.css.
// DECISION: next/og's built-in sans font. The self-hosted fonts are WOFF2, which next/og can't
// read, and bundling extra font files into the server function isn't worth it for share cards.

export const OG_SIZE = { width: 1200, height: 630 }

export function OgCard({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#fbfaf8',
        color: '#1c1c1e',
        padding: '72px 80px',
        borderTop: '24px solid #1f6f5c',
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, color: '#1f6f5c', fontWeight: 700 }}>
        {eyebrow}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: title.length > 60 ? 60 : 72,
          lineHeight: 1.1,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28 }}>
        <span style={{ fontWeight: 700 }}>EthicAI</span>
        <span style={{ color: '#5c5c63' }}>A.I. grounded in human dignity</span>
      </div>
    </div>
  )
}
