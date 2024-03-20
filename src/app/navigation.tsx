'use client';

import { getConcoctions } from './concoctions/utilities';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const links = getConcoctions();
  const pathName = usePathname();

  const active = links.find(l => `/concoctions/${l.linkUrl}` === pathName);

  return (
    <nav>
      <ul className='flex flex-row gap-2'>
        {links.map((value) => (
          <li key={value.linkUrl} className='flex'>
            <Link
              href={`/concoctions/${value.linkUrl}`}
              className={`link ${value.linkUrl === active?.linkUrl ? 'active' : ''}`}>
              {value.linkTitle}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;