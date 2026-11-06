'use client'

import { createClientFeature, useEditorConfigContext } from '@payloadcms/richtext-lexical/client'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from '@payloadcms/richtext-lexical/lexical'
import { $convertFromMarkdownString } from '@payloadcms/richtext-lexical/lexical/markdown'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { useEffect } from 'react'

import { shouldConvertPaste } from '@/lib/markdown-paste'

// Pasting Markdown text into the article body turns it into headings, lists, links and so on, so
// the maintainer can draft elsewhere and paste (BUILD-SPEC §8). Anything that is already rich
// (Word, Google Docs, a web page) or isn't Markdown goes through the editor's normal paste.
function MarkdownPastePlugin() {
  const [editor] = useLexicalComposerContext()
  const { editorConfig } = useEditorConfigContext()
  const transformers = editorConfig.features.markdownTransformers

  useEffect(() => {
    if (!transformers?.length) return

    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent) || !event.clipboardData) return false
        const text = event.clipboardData.getData('text/plain')
        const html = event.clipboardData.getData('text/html')
        if (!shouldConvertPaste({ text, html })) return false

        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        event.preventDefault()
        // The converter fills a container node (and moves the selection into it), so it runs on a
        // throwaway paragraph that is never attached to the document. The result is then inserted
        // at the caret, replacing any selected text.
        const caret = selection.clone()
        const holder = $createParagraphNode()
        $convertFromMarkdownString(text, transformers, holder)
        $setSelection(caret)
        caret.insertNodes(holder.getChildren())
        return true
      },
      // Ahead of the editor's own paste handling, which would insert the raw text.
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor, transformers])

  return null
}

export const MarkdownPasteFeatureClient = createClientFeature({
  plugins: [{ Component: MarkdownPastePlugin, position: 'normal' }],
})
