'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { getConcoctions } from '@/app/concoctions/utilities'
import NavItem from './nav-item'

type NavigationProps = {
  baseUrl?: string
};

const Navigation = ({ baseUrl }: NavigationProps) => {
  const links = getConcoctions()
  const pathName = usePathname()
  const concoctionId = pathName.split('/').pop()
  const searchParams = useSearchParams()
  const isApp = searchParams.has("app")
  const itemBaseUrl = baseUrl !== undefined ? `/${baseUrl.replace(/^\//, '').replace(/\/$/, '')}` : ''

  const constructPath = (linkUrl: string) => {
    const trimUrl = linkUrl.replace(/^\//, '')
    return `${itemBaseUrl}/${trimUrl}`
  }

  return isApp === false ? (
    <section className="flex flex-col self-center">
      <nav>
        <ul className='flex flex-row gap-2'>
          <li key='/' className='flex'>
            <NavItem
              href='/'
              title='Home'
              isActive={pathName === '/'} />
          </li>
          {links.map((value) => (
            <li key={value.linkUrl} className='flex'>
              <NavItem
                href={`${constructPath(value.linkUrl)}`}
                title={value.linkTitle}
                previewHref={value.previewUrl ? value.previewUrl : '/previews/default.gif'}
                isActive={value.linkUrl === concoctionId}
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  ) : null
}

export default Navigation