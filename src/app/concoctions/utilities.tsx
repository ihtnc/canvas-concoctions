import { NavigationDetails as sandSimNav } from './sand-sim';
import { NavigationDetails as tagVisualiserNav } from './tag-visualiser';
import { NavigationDetails as gameOfLifeNav } from './game-of-life';

export type ConcoctionNavigation = {
  linkTitle: string,
  linkUrl: string,
  title: string,
  previewUrl?: string
};

type GetConcoctionsResponse = Array<ConcoctionNavigation>;
export const getConcoctions = (): GetConcoctionsResponse => {
  return [
    sandSimNav,
    tagVisualiserNav,
    gameOfLifeNav
  ];
};
