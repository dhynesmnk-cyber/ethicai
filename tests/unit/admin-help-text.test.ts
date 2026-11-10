import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { Articles } from '@/collections/Articles'
import { Media } from '@/collections/Media'
import { Services } from '@/collections/Services'
import { TeamMembers } from '@/collections/TeamMembers'
import { Testimonials } from '@/collections/Testimonials'
import { Users } from '@/collections/Users'
import { Videos } from '@/collections/Videos'
import { PageCopy } from '@/globals/PageCopy'
import { SiteSettings } from '@/globals/SiteSettings'

// BUILD-SPEC §8: "sensible admin.description copy on every field". The maintainer should never
// have to guess what a field is for, so a new field without help text fails here.

type Described = { admin?: { description?: unknown; hidden?: boolean } }

/** Walks nested tabs, rows, groups and arrays, returning "path" for each field lacking help text. */
function undescribed(fields: Field[], parent = ''): string[] {
  return fields.flatMap((field) => {
    if (field.type === 'tabs') {
      return field.tabs.flatMap((tab) => {
        const tabPath = 'name' in tab && tab.name ? `${parent}${tab.name}.` : parent
        // A named tab carries its own description; an unnamed one only groups its fields.
        return undescribed(tab.fields, tabPath)
      })
    }
    if (field.type === 'row' || field.type === 'collapsible') {
      return undescribed(field.fields, parent)
    }
    if (!('name' in field) || !field.name) return []

    const path = `${parent}${field.name}`
    const nested = 'fields' in field ? undescribed(field.fields, `${path}.`) : []
    const { admin } = field as Described
    // Hidden fields are never shown, so they need no help text.
    return admin?.hidden || admin?.description ? nested : [path, ...nested]
  })
}

const targets: Array<[string, CollectionConfig | GlobalConfig]> = [
  ['articles', Articles],
  ['videos', Videos],
  ['media', Media],
  ['services', Services],
  ['teamMembers', TeamMembers],
  ['testimonials', Testimonials],
  ['users', Users],
  ['siteSettings', SiteSettings],
  ['pageCopy', PageCopy],
]

describe('admin help text', () => {
  it.each(targets)('every field in %s has a description', (_name, config) => {
    expect(undescribed(config.fields)).toEqual([])
  })
})
