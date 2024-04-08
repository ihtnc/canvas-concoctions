'use client';

import { type DrawHandler } from "@/components/canvas/types";
import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import Canvas from "@/components/canvas";

type TagVisualiserProps = {
  className?: string
};

const TagVisualiser = ({ className }: TagVisualiserProps) => {
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
  linkTitle: 'Tag Visualiser',
  linkUrl: 'tag-visualiser',
  title: 'Tag Visualiser'
};

export default TagVisualiser;