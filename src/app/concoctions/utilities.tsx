import { NavigationDetails as sandSimNav } from './sand-sim';
import { NavigationDetails as tagVisualiserNav } from './tag-visualiser';

export type ConcoctionNavigation = {
  linkTitle: string,
  linkUrl: string,
  title: string
};

type GetConcoctionsResponse = Array<ConcoctionNavigation>;
export const getConcoctions = (): GetConcoctionsResponse => {
  return [
    sandSimNav,
    tagVisualiserNav
  ];
};
