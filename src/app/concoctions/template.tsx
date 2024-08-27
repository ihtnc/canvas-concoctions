'use client'

import { useAppDisplay } from '@/utilities/app-operations'
import { getConcoction } from './utilities'
import { useSelectedLayoutSegment } from 'next/navigation'
import { type MouseEventHandler } from 'react'

const ConcoctionsTemplate = ({ children }: { children: JSX.Element }) => {
  const segment = useSelectedLayoutSegment()
  const current = segment !== null ? getConcoction(segment) : undefined
  const { title: showTitle } = useAppDisplay()

  const contextMenuHandler: MouseEventHandler = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <section className='flex flex-col w-full h-full gap-2' onContextMenu={contextMenuHandler}>
      {showTitle && <h1 className='self-center'>{current?.title ?? 'Concoction'}</h1>}
      {children}
    </section>
  )
}

export default ConcoctionsTemplate