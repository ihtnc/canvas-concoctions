import TagVisualiser from "."
import NavigationDetails from "./navigation-details"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: NavigationDetails.title
}

const Page = () => {
  return <TagVisualiser className="border border-black grow" />
}

export default Page