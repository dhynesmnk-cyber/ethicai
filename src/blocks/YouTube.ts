import type { Block } from 'payload'

import { parseVideoUrl } from '@/lib/video-url'

/** Rich-text block for embedding a YouTube video inside an article (rendered as a click-to-load facade). */
export const YouTubeBlock: Block = {
  slug: 'youtube',
  interfaceName: 'YouTubeBlock',
  labels: { singular: 'YouTube video', plural: 'YouTube videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) =>
        parseVideoUrl(value)?.platform === 'youtube' ||
        'Paste a YouTube link, e.g. https://youtu.be/…',
      admin: { description: 'Any YouTube link: watch page, youtu.be share link or Shorts.' },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Short description of the video, read out by screen readers on the player.',
      },
    },
  ],
}
