import type { ReactNode } from 'react'

import type { Crumb } from '@/components/family/Breadcrumbs'
import { PageHero } from '@/components/family/PageHero'
import { JsonLd } from '@/components/JsonLd'
import type { Photo } from '@/lib/photography'
import { breadcrumbSchema, webPageSchema } from '@/lib/structured-data'

type Props = {
  /** This page's path, e.g. "/watch". */
  path: string
  title: string
  lead?: string | null
  /** The page's photograph (see photoFor); utility pages leave it out for a plain header. */
  photo?: Photo | null
  /** Parents of this page, after Home; this page is added at the end. */
  parents?: Crumb[]
  type?: Parameters<typeof webPageSchema>[0]['type']
  description?: string
  actions?: ReactNode
}

/**
 * The opening of an inner page: the photographic hero with breadcrumbs, plus the page's WebPage
 * and BreadcrumbList structured data (which point back to the site-wide Organization and WebSite).
 */
export function PageIntro({
  path,
  title,
  lead,
  photo,
  parents = [],
  type,
  description,
  actions,
}: Props) {
  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }, ...parents, { name: title, path }]
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ path, name: title, description: description ?? lead ?? undefined, type }),
          breadcrumbSchema(crumbs),
        ]}
      />
      <PageHero title={title} lead={lead} photo={photo} breadcrumbs={crumbs} actions={actions} />
    </>
  )
}
