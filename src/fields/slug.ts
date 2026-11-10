import type { RowField, TextField, TextFieldSingleValidation } from 'payload'
import { slugField } from 'payload'
import { text } from 'payload/shared'

import { SLUG_PATTERN } from '@/lib/site-url'

/**
 * Payload's slug field (filled in from the title), with this site's URL-safe check and help text
 * that tells the maintainer where the slug appears.
 */
export function urlSlugField(description: string): RowField {
  return slugField({
    overrides: (row) => {
      for (const field of row.fields) {
        if ('name' in field && field.name === 'slug') {
          const slugInput = field as TextField
          const validateSlug: TextFieldSingleValidation = (value, options) => {
            if (value && !SLUG_PATTERN.test(value)) {
              return 'Use lowercase letters, numbers and single hyphens only, e.g. "ai-and-hr".'
            }
            return text(value, options)
          }
          slugInput.validate = validateSlug
          slugInput.admin = { ...slugInput.admin, description }
        }
      }
      return row
    },
  })
}

/** Accepts an empty value or a full https:// link. */
export const httpsUrl = (value: string | null | undefined): true | string => {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:' || 'Use a full https:// link.'
  } catch {
    return 'Use a full https:// link.'
  }
}
