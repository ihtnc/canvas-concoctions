import SandSim from "."
import NavigationDetails from "./navigation-details"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: NavigationDetails.title
}

const Page = () => {
  return <SandSim
    className="border border-black grow"
  />
}

export default Page