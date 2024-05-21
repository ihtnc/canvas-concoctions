import { useSearchParams } from "next/navigation"

type AppDisplay = {
  nav: boolean,
  title: boolean,
  padding: boolean
}

export const useAppDisplay = (): AppDisplay => {
  const searchParams = useSearchParams()

  return {
    nav: searchParams.has("no-nav") === false,
    title: searchParams.has("no-title") === false,
    padding: searchParams.has("no-padding") === false
  }
}