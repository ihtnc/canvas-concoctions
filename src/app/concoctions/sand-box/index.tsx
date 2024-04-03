'use client';

import { type DrawHandler } from "@/components/canvas/types";
import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import Canvas from "@/components/canvas";

type SandboxProps = {
  className?: string
};

const Sandbox = ({ className }: SandboxProps) => {
  let frameCount = 0;
  const drawFn: DrawHandler = (context) => {
    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(50, 50, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI);
    context.fill();
    frameCount++;
  }
  return <Canvas draw={drawFn} className={className} />
};

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Sandbox',
  linkUrl: 'sand-box',
  title: 'Sandbox'
};

export default Sandbox;