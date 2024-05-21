import { constructPublicPath } from "@/utilities/client-operations"
import TankGame from "."
import NavigationDetails from "./navigation-details"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: NavigationDetails.title
}

const Page = () => {
  const background = constructPublicPath("/resources/tank-game/background.svg")
  return <div style={{ backgroundImage: `url('${background}')` }}
    className="bg-no-repeat bg-cover bg-bottom grow p-12"
  >
    <TankGame className="h-full w-full" />
  </div>
}

export default Page