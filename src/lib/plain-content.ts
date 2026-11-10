import config from '@payload-config'
import { convertLexicalToMarkdown, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from 'lexical'
import { getPayload } from 'payload'

import { articleEditorFeatures } from '@/fields/articleEditor'

/** Rich text (articles, services) as Markdown, for llms-full.txt. Never throws. */
export async function richTextToMarkdown(data: unknown): Promise<string> {
  try {
    const payload = await getPayload({ config })
    const editorConfig = await editorConfigFactory.fromFeatures({
      config: payload.config,
      features: articleEditorFeatures,
    })
    return convertLexicalToMarkdown({ data: data as SerializedEditorState, editorConfig }).trim()
  } catch {
    return ''
  }
}
