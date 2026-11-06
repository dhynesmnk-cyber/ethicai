import { createServerFeature } from '@payloadcms/richtext-lexical'

// Server half of the Markdown paste feature: it only points the editor at the client plugin in
// ./client.tsx. Nothing is stored differently; pasted Markdown becomes ordinary rich text.
export const MarkdownPasteFeature = createServerFeature({
  feature: {
    ClientFeature: '@/fields/markdownPaste/client#MarkdownPasteFeatureClient',
  },
  key: 'markdownPaste',
})
