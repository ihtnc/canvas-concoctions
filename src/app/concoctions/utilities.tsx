import { NavigationDetails as sandboxNav } from './sand-box';
import { NavigationDetails as sandSimNav } from './sand-sim';

export type ConcoctionNavigation = {
  linkTitle: string,
  linkUrl: string,
  title: string
};

type GetConcoctionsResponse = Array<ConcoctionNavigation>;
export const getConcoctions = (): GetConcoctionsResponse => {
  return [
    sandboxNav,
    sandSimNav
  ];
};
