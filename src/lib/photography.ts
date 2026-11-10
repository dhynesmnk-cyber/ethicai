import type { StaticImageData } from 'next/image'

import closing from '@/assets/photos/gum-tree-moonlight-mount-majura.jpg'
import newsletter from '@/assets/photos/gums-in-sydney-fog.jpg'
import selma from '@/assets/photos/snow-gums-kosciuszko.jpg'
import articles from '@/assets/photos/scribbly-gum-bark.jpg'
import services from '@/assets/photos/spotted-gum-forest.jpg'
import home from '@/assets/photos/sydney-blue-gums-westleigh.jpg'
import about from '@/assets/photos/sydney-red-gum-canopy.jpg'
import contact from '@/assets/photos/sydney-red-gums-royal-national-park.jpg'
import watch from '@/assets/photos/eucalypt-golden-hour.jpg'
import type { PhotoSlot } from '@/content/photo-slots'
import { toImage } from '@/lib/media'
import type { Media, PageCopy } from '@/payload-types'

// The site's photography: Australian native trees, as selma.au uses Australian places.
//
// DECISION: Creative Commons photos from Wikimedia Commons, bundled as defaults, rather than
// stock photos: they're real, specific Australian places (mostly around Sydney) with clear
// licences, and there was no client photography yet. Each one can be replaced in the admin
// (Page copy → Photos), and the credits the licences ask for are on /photo-credits.
// Photos were resized and compressed for the web (src/assets/photos); nothing else was changed.

export type PhotoCredit = {
  /** What the photo shows, in our words. */
  title: string
  author: string
  /** The photo's page on Wikimedia Commons. */
  source: string
  licence: 'CC BY 2.0' | 'CC BY-SA 4.0'
  licenceUrl: string
}

export type Photo = {
  src: StaticImageData | string
  /** Describes the photo. Heroes and bands show it as a background, so they pass alt="". */
  alt: string
  /** CSS object-position: which part of the photo to keep when it's cropped. */
  position?: string
  /** Bundled photos only: an editor's own upload has no credit to show. */
  credit?: PhotoCredit
}

const BY_2 = {
  licence: 'CC BY 2.0',
  licenceUrl: 'https://creativecommons.org/licenses/by/2.0/',
} as const
const BY_SA_4 = {
  licence: 'CC BY-SA 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const

export const DEFAULT_PHOTOS: Record<PhotoSlot, Photo & { credit: PhotoCredit }> = {
  home: {
    src: home,
    alt: 'Tall, pale trunks of Sydney blue gums rising above a fern-filled forest floor',
    position: 'center 40%',
    credit: {
      title: 'Sydney blue gum forest, Westleigh, NSW',
      author: 'Peter Woodard (Poyt448)',
      source: 'https://commons.wikimedia.org/wiki/File:Sydney_Blue_Gum_Forest_Westleigh.jpg',
      ...BY_SA_4,
    },
  },
  about: {
    src: about,
    alt: 'Looking up into the twisting salmon-pink limbs of a Sydney red gum against blue sky',
    position: 'center 35%',
    credit: {
      title: 'Sydney red gum (Angophora costata), McKay Reserve, Palm Beach, NSW',
      author: 'Margaret R. Donald',
      source: 'https://commons.wikimedia.org/wiki/File:Angophora_costata_Habit.jpg',
      ...BY_SA_4,
    },
  },
  services: {
    src: services,
    alt: 'A dense stand of dappled grey and cream spotted gum trunks',
    position: 'center 50%',
    credit: {
      title: 'Spotted gum forest, Pokolbin, NSW',
      author: 'John Tann',
      source: 'https://commons.wikimedia.org/wiki/File:Spotted_gum_forest_(3242838455).jpg',
      ...BY_2,
    },
  },
  articles: {
    src: articles,
    alt: 'Insect scribbles tracing lines across the smooth pale bark of a scribbly gum',
    position: 'center 45%',
    credit: {
      title: 'Scribbly gum (Eucalyptus haemastoma), Royal National Park, NSW',
      author: 'John Tann',
      source: 'https://commons.wikimedia.org/wiki/File:Scribbly_Gum_scribbles_(8349111780).jpg',
      ...BY_2,
    },
  },
  watch: {
    src: watch,
    alt: 'A lone eucalypt lit gold by late afternoon sun on a grassy common',
    position: 'center 55%',
    credit: {
      title: 'Eucalypt on Gundaroo Common, NSW',
      author: 'John Tann',
      source: 'https://commons.wikimedia.org/wiki/File:Eucalyptus_A_(8754003544).jpg',
      ...BY_2,
    },
  },
  newsletter: {
    src: newsletter,
    alt: 'Gum tree branches fading into a soft grey winter fog',
    position: 'center 40%',
    credit: {
      title: 'Gum trees in the Sydney winter fog, NSW',
      author: 'Alex Proimos',
      source:
        'https://commons.wikimedia.org/wiki/File:Gum_Trees_in_the_Sydney_Winter_Fog,_New_South_Wales,_Australia_(3593082913).jpg',
      ...BY_2,
    },
  },
  contact: {
    src: contact,
    alt: 'A bush track winding between the knotted trunks of Sydney red gums',
    position: 'center 60%',
    credit: {
      title: 'Sydney red gums (Angophora costata), Royal National Park, NSW',
      author: 'Pimlico27',
      source:
        'https://commons.wikimedia.org/wiki/File:Sydney_red_gum_(Angophora_costata)_in_Royal_National_Park.jpg',
      ...BY_SA_4,
    },
  },
  selma: {
    src: selma,
    alt: 'Gnarled snow gums growing among granite boulders on a mountainside',
    position: 'center 55%',
    credit: {
      title: 'Snow gums on Mount Morgan, Kosciuszko National Park, NSW',
      author: 'Steve Bittinger',
      source: 'https://commons.wikimedia.org/wiki/File:Kosciuszko_National_Park_(52035807900).jpg',
      ...BY_2,
    },
  },
  closing: {
    src: closing,
    alt: 'The dark silhouette of a gum tree’s branches under a bright moon and stars',
    position: 'center 40%',
    credit: {
      title: 'Gum tree under the moon, Mount Majura Nature Reserve, Canberra',
      author: 'Thennicke',
      source:
        'https://commons.wikimedia.org/wiki/File:Gum_tree_with_moon,_Mount_Majura_Nature_Reserve.jpg',
      ...BY_SA_4,
    },
  },
}

/** The editor's upload for a slot, if there is one (Home's lives under Home → Hero). */
function uploadFor(copy: PageCopy, slot: PhotoSlot): Media | number | null | undefined {
  return slot === 'home' ? copy.hero?.image : copy.photos?.[slot]
}

/**
 * The photo to show in a slot: the editor's upload from Page copy if there is one, otherwise the
 * bundled default. An upload keeps the default's crop position, which suits most landscapes.
 */
export function photoFor(copy: PageCopy, slot: PhotoSlot): Photo {
  const fallback = DEFAULT_PHOTOS[slot]
  const upload = toImage(uploadFor(copy, slot), 'hero')
  if (!upload) return fallback
  return { src: upload.url, alt: upload.alt, position: fallback.position }
}

/** Bundled photos currently on the site (slots without an upload), for the credits page. */
export function creditedPhotos(copy: PageCopy): Array<Photo & { credit: PhotoCredit }> {
  return (Object.keys(DEFAULT_PHOTOS) as PhotoSlot[])
    .filter((slot) => !toImage(uploadFor(copy, slot), 'hero'))
    .map((slot) => DEFAULT_PHOTOS[slot])
}
