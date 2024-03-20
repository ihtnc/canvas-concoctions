'use client';

import { type ReactNode } from 'react';
import { getConcoctions } from './utilities';
import { useSelectedLayoutSegment } from 'next/navigation';

const ConcoctionsTemplate = ({ children }: { children: ReactNode }) => {
  const links = getConcoctions();
  const segment = useSelectedLayoutSegment();

  const active = links.find(l => l.linkUrl === segment);

  return (
    <section className='flex flex-col w-full grow'>
      <h1 className='self-center'>{active?.title}</h1>
      <div className='flex w-full grow justify-center'>
        {children}
      </div>
    </section>
  );
};

export default ConcoctionsTemplate;