import type { ReactNode } from 'react'

import type { Crumb } from '@/components/family/Breadcrumbs'
import { DarkHero } from '@/components/family/DarkHero'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema, webPageSchema } from '@/lib/structured-data'

type Props = {
  /** This page's path, e.g. "/watch". */
  path: string
  title: string
  lead?: string | null
  eyebrow?: string | null
  /** Parents of this page, after Home; this page is added at the end. */
  parents?: Crumb[]
  type?: Parameters<typeof webPageSchema>[0]['type']
  description?: string
  actions?: ReactNode
}

/**
 * The opening of an inner page: the dark hero with breadcrumbs, plus the page's WebPage and
 * BreadcrumbList structured data (which point back to the site-wide Organization and WebSite).
 */
export function PageIntro({
  path,
  title,
  lead,
  eyebrow,
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
      <DarkHero
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        breadcrumbs={crumbs}
        actions={actions}
      />
    </>
  )
}
