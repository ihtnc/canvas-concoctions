'use client'

import { getConcoction } from './utilities'
import { useSelectedLayoutSegment } from 'next/navigation'

const ConcoctionsTemplate = ({ children }: { children: JSX.Element }) => {
  const segment = useSelectedLayoutSegment()
  const current = segment !== null ? getConcoction(segment) : undefined

  return (
    <section className='flex flex-col w-full h-full gap-2'>
      <h1 className='self-center'>{current?.title ?? 'Concoction'}</h1>
      {children}
    </section>
  )
}

export default ConcoctionsTemplate