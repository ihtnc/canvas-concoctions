import { NavigationDetails as sandboxNav } from './sand-box';
export type ConcoctionNavigation = {
  linkTitle: string,
  linkUrl: string,
  title: string
};

type GetConcoctionsResponse = Array<ConcoctionNavigation>;
export const getConcoctions = (): GetConcoctionsResponse => {
  return [
    sandboxNav,
  ];
};
