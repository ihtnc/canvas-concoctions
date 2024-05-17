import { NavigationDetails as sandSimNav } from './sand-sim'
import { NavigationDetails as tagVisualiserNav } from './tag-visualiser'
import { NavigationDetails as gameOfLifeNav } from './game-of-life'

const concoctions = [
  sandSimNav,
  tagVisualiserNav,
  gameOfLifeNav
]

export type ConcoctionNavigation = {
  linkTitle: string,
  linkUrl: string,
  title: string,
  previewUrl?: string
};

export const getConcoctions = (): Array<ConcoctionNavigation> => {
  return concoctions
}

export const getConcoction = (linkUrl: string): ConcoctionNavigation | undefined => {
  if (linkUrl === undefined) { return undefined }

  const filtered = concoctions.find(c => c.linkUrl === linkUrl)
  return filtered
}
