'use client'

import { type ConcoctionNavigation } from "@/app/concoctions/utilities"
import { type DrawHandler, RenderLocation } from "@/components/canvas/types"
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas"
import { renderGame } from "./engine"

type TankGameProps = {
  className?: string
};

const TankGame = ({ className }: TankGameProps) => {

  const drawFn: DrawHandler = ({ context, frame }) => {
    renderGame(
      context,
      frame,
      [],
      []
    )
  }

  const { Canvas, debug } = useAnimatedCanvas({
    draw: drawFn,
    options: { enableDebug: true },
    renderEnvironmentLayerRenderer: RenderLocation.BottomCenter
  })

  return <>
    <Canvas className={className} />
  </>
}

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Tank Game',
  linkUrl: 'tank-game',
  title: 'Tank Game'
}

export default TankGame