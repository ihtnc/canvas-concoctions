'use client';

import { usePathname } from 'next/navigation';
import { getConcoctions } from '@/app/concoctions/utilities';
import NavItem from './nav-item';

const Navigation = () => {
  const links = getConcoctions();
  const pathName = usePathname();

  const activeLink = links.find(l => `/concoctions/${l.linkUrl}` === pathName);
  const isHomeActive = pathName === '/';

  return (
    <nav>
      <ul className='flex flex-row gap-2'>
        <li key='/' className='flex'>
          <NavItem
            href='/'
            title='Home'
            isActive={isHomeActive} />
        </li>
        {links.map((value) => (
          <li key={value.linkUrl} className='flex'>
            <NavItem
              href={`/concoctions/${value.linkUrl}`}
              title={value.linkTitle}
              previewHref={value.previewUrl ? value.previewUrl : undefined}
              isActive={value.linkUrl === activeLink?.linkUrl}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;