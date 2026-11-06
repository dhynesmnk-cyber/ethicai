import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { YouTubeBlock } from '@/blocks/YouTube'
import { MarkdownPasteFeature } from '@/fields/markdownPaste'

// Long-form toolbar for articles (BUILD-SPEC §4.3, §8). Every feature enabled here needs a
// renderer on the frontend, so keep the list deliberate.
export const articleEditorFeatures = [
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  // DECISION: external links only. Internal document links would need lookups when rendering;
  // article URLs are stable, so linking by URL is simpler.
  LinkFeature({ enabledCollections: [] }),
  UnorderedListFeature(),
  OrderedListFeature(),
  BlockquoteFeature(),
  HorizontalRuleFeature(),
  BlocksFeature({ blocks: [YouTubeBlock] }),
  // Pasted Markdown becomes formatted text. Placed after the block features so their Markdown
  // transformers are all known when it runs.
  MarkdownPasteFeature(),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
]

export const articleEditor = lexicalEditor({ features: () => articleEditorFeatures })

/** Short rich text (site footer): paragraphs, emphasis and links only. */
export const minimalEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({ enabledCollections: [] }),
    InlineToolbarFeature(),
  ],
})
