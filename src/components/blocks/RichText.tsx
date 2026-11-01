import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

import { YouTubeFacade } from '@/components/feed/YouTubeFacade'
import { parseVideoUrl } from '@/lib/video-url'
import type { YouTubeBlock } from '@/payload-types'

// Renders Lexical content from Payload. Every editor feature enabled in
// src/fields/articleEditor.ts must render correctly here.

const converters: JSXConvertersFunction<DefaultNodeTypes | SerializedBlockNode<YouTubeBlock>> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    youtube: ({ node }) => {
      const video = parseVideoUrl(node.fields.url)
      if (video?.platform !== 'youtube') return null
      return (
        <div className="overflow-hidden rounded-card">
          <YouTubeFacade
            videoId={video.videoId}
            title={node.fields.title || 'YouTube video'}
            sizes="(min-width: 768px) 68ch, 100vw"
          />
        </div>
      )
    },
  },
})

type Props = {
  data: ComponentProps<typeof LexicalRichText>['data']
  className?: string
}

// Renders the nodes without Payload's wrapper <div>, so inside <Prose> each paragraph, heading
// and list is a direct child and the spacing rules apply. A className adds a plain wrapper.
export function RichText({ data, className }: Props) {
  const content = <LexicalRichText data={data} converters={converters} disableContainer />
  return className ? <div className={className}>{content}</div> : content
}
