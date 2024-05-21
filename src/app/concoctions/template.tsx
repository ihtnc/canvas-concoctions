'use client'

import { useAppDisplay } from '@/utilities/app-operations'
import { getConcoction } from './utilities'
import { useSelectedLayoutSegment } from 'next/navigation'

const ConcoctionsTemplate = ({ children }: { children: JSX.Element }) => {
  const segment = useSelectedLayoutSegment()
  const current = segment !== null ? getConcoction(segment) : undefined
  const { title: showTitle } = useAppDisplay()

  return (
    <section className='flex flex-col w-full h-full gap-2'>
      {showTitle && <h1 className='self-center'>{current?.title ?? 'Concoction'}</h1>}
      {children}
    </section>
  )
}

export default ConcoctionsTemplate