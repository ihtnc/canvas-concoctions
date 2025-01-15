import { useFloating, useHover, useInteractions } from '@floating-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { constructPublicPath } from '@/utilities/client-operations'

type NavItemProps = {
  href: string,
  className?: string,
  title: string,
  previewHref?: string,
  isActive?: boolean
};

const NavItem = ({ href, className, title, previewHref, isActive }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen
  })
  const hover = useHover(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <>
      <Link
        ref={refs.setReference}
        href={href}
        className={`link ${className ?? ''} ${isActive ? 'active': ''}`}
        {...getReferenceProps()}
      >
        {title}
      </Link>
      {!isActive && previewHref && isOpen && (
        <Image
          className='w-72 h-auto border border-black'
          src={constructPublicPath(previewHref)} alt={title}
          width='0' height='0'
          ref={refs.setFloating}
          style={floatingStyles}
          unoptimized={true}
          { ...getFloatingProps()}
        />
      )}
    </>
  )
}

export default NavItem