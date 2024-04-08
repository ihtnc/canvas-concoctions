'use client';

import { type DrawHandler } from "@/components/canvas/types";
import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import Canvas from "@/components/canvas";

type GameOfLifeProps = {
  className?: string
};

const GameOfLife = ({ className }: GameOfLifeProps) => {
  const drawFn: DrawHandler = (context) => { }
  return <Canvas
    draw={drawFn}
    debugLayerRenderer={true}
    className={className}
  />
};

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Game of Life',
  linkUrl: 'game-of-life',
  title: 'Game of Life'
};

export default GameOfLife;