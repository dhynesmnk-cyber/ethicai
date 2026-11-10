import { ImageResponse } from 'next/og'

import { OG_SIZE, OgCard } from '@/components/OgImage'

// Default share image for every page without its own.
export const alt = 'EthicAI: AI grounded in human dignity'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <OgCard kicker="ethicai.au" title="Helping organisations adopt AI ethically" />,
    size,
  )
}
