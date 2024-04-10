'use client';

import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import { type DrawHandler } from "@/components/canvas/types";
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas";

type GameOfLifeProps = {
  className?: string
  };

const GameOfLife = ({ className }: GameOfLifeProps) => {
  let frameCount = 0;
  const drawFn: DrawHandler = (context) => {
    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(50, 50, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI);
    context.fill();
    frameCount++;
  };

  const { Canvas, renderBreak, renderContinue, renderStep } = useAnimatedCanvas({
    draw: drawFn,
    options: {
      autoStart: false,
      enableDebug: true,
    },
    renderEnvironmentLayerRenderer: true
  });

  return <div className="flex flex-col w-full h-full gap-2">
    <Canvas
      className={className}
    />
    <div className="flex self-center gap-2">
      <button className="flex" onClick={renderContinue}>Start</button>
      <button className="flex" onClick={renderBreak}>Stop</button>
      <button className="flex" onClick={renderStep}>Step</button>
    </div>
  </div>
};

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Game of Life',
  linkUrl: 'game-of-life',
  title: 'Game of Life'
};

export default GameOfLife;