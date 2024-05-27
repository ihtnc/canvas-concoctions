import { constructPublicPath } from "@/utilities/client-operations"
import { Metadata } from "next"

const metadata: Metadata = {
  title: "Canvas Concoctions",
  description: "Playground for various ideas using the canvas HTML element",
  icons: constructPublicPath("/resources/icons/concoctions-favicon.svg")
}

export default metadata
