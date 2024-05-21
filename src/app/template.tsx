'use client'

import Navigation from "@/components/navigation"
import { useAppDisplay } from "@/utilities/app-operations"

const PageTemplate = ({ children }: { children: JSX.Element }) => {
  const { padding: hasPadding } = useAppDisplay()

  return (
    <main className={`flex flex-col w-dvw h-dvh items-center ${hasPadding ? 'p-12' : ''} min-w-96 min-h-96 gap-4`}>
      <Navigation baseUrl="/concoctions" />
      {children}
    </main>
  )
}

export default PageTemplate