// Layout for generated share images (next/og). Satori only understands inline styles and a
// subset of CSS, so no Tailwind here; colours mirror the tokens in globals.css.
// DECISION: next/og's built-in sans font. The self-hosted fonts are WOFF2, which next/og can't
// read, and bundling extra font files into the server function isn't worth it for share cards.
// DECISION: typographic, without a photo. Reading a photo from disk inside the share-image
// function depends on how the host bundles files, and a plain card still reads well when small.

export const OG_SIZE = { width: 1200, height: 630 }

export function OgCard({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#0a0a0c',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, color: '#a1a1a6' }}>{kicker}</div>
      <div
        style={{
          display: 'flex',
          maxWidth: 980,
          fontSize: title.length > 60 ? 62 : 76,
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 28,
          borderTop: '2px solid #534ab7',
          paddingTop: 28,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 36 }}>EthicAI</span>
        <span style={{ color: '#a1a1a6' }}>AI grounded in human dignity</span>
      </div>
    </div>
  )
}
