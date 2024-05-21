import sandSim from './sand-sim/navigation-details'
import tagVisualiser from './tag-visualiser/navigation-details'
import gameOfLife from './game-of-life/navigation-details'
import tankGame from './tank-game/navigation-details'

const concoctions = [
  sandSim,
  tagVisualiser,
  gameOfLife,
  tankGame
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
