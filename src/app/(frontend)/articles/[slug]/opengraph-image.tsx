import { ImageResponse } from 'next/og'

import { OG_SIZE, OgCard } from '@/components/OgImage'
import { toImage } from '@/lib/media'
import { getArticleBySlug } from '@/lib/queries'

// Share image for an article (BUILD-SPEC §9): the SEO override image when one is set, otherwise
// a generated card with the title and brand band.
export const alt = 'EthicAI article'
export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug, false)
  const override = toImage(article?.seo?.ogImage, 'hero')

  return new ImageResponse(
    override ? (
      // next/og renders plain <img>; next/image doesn't apply here.
      <img
        src={override.url}
        alt={override.alt}
        width={size.width}
        height={size.height}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <OgCard kicker="Article" title={article?.title ?? 'EthicAI'} />
    ),
    size,
  )
}
