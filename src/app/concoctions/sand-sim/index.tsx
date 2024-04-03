'use client';

import {
  type PointerEventHandler,
  type MouseEventHandler,
  useRef
} from "react";
import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import {
  type MatrixValue,
  type MatrixCoordinate
} from "@/utilities/matrix-operations";
import { hexToHSL } from "@/utilities/drawing-operations";
import {
  RenderLocation,
  type PreDrawHandler,
  type DrawHandler,
  type InitRenderHandler,
  type OnResizeHandler
} from "@/components/canvas/types";
import Canvas from "@/components/canvas";
import { renderDebugLayer } from "./debug";
import {
  type ParticleValue,
  initialiseParticleMap,
  resetParticleMap,
  resizeParticleMap,
  runParticleMapPipeline,
  runRenderPipeline
} from "./engine";

type SandboxProps = {
  className?: string,
  grainSize?: number,
  initialColor?: string,
  rotateColor?: boolean
};

type DefaultData = {
  MinGrainSize: number,
  MaxGrainSize: number,
  ColorIncrement: number,
  DefaultGrainSize: number,
  DefaultInitialColor: string,
  DefaultRotateColor: boolean
}
const DEFAULT_DATA: DefaultData = {
  MinGrainSize: 5,
  MaxGrainSize: 20,
  ColorIncrement: 30,
  DefaultGrainSize: 5,
  DefaultInitialColor: '#C2B180',
  DefaultRotateColor: true
}

const SandSim = ({
  className,
  grainSize = DEFAULT_DATA.DefaultGrainSize,
  initialColor = DEFAULT_DATA.DefaultInitialColor,
  rotateColor = DEFAULT_DATA.DefaultRotateColor
}: SandboxProps) => {
  const particleMap = useRef<MatrixValue<ParticleValue> | null>(null);
  let canGenerateParticle: boolean = false;
  const newParticleCoordinate: MatrixCoordinate = { row: 0, col: 0 };

  if (grainSize < DEFAULT_DATA.MinGrainSize) { grainSize = DEFAULT_DATA.MinGrainSize; }
  else if (grainSize > DEFAULT_DATA.MaxGrainSize) { grainSize = DEFAULT_DATA.MaxGrainSize; }

  const initialHSL = hexToHSL(initialColor);
  const currentHSL = initialHSL === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultInitialColor)!
    : initialHSL!;

  const initFn: InitRenderHandler = (canvas) => {
    const row = Math.floor(canvas.height / grainSize);
    const col = Math.floor(canvas.width / grainSize);
    const map = initialiseParticleMap(row, col);
    particleMap.current = map;
  };

  const onResizeFn: OnResizeHandler = (canvas, width, height) => {
    if (particleMap?.current === null) { return; }

    const newRow = Math.floor(height / grainSize);
    const newCol = Math.floor(width / grainSize);

    const newSize = resizeParticleMap(particleMap.current, newRow, newCol);
    particleMap.current = newSize;
  };

  const predrawFn: PreDrawHandler = (canvas, context) => {
    if (particleMap.current === null) { return; }

    const map = particleMap.current;
    const newMap = runParticleMapPipeline(map, currentHSL, canGenerateParticle ? newParticleCoordinate : undefined);
    particleMap.current = newMap;
  };

  const drawFn: DrawHandler = (context) => {
    if (particleMap?.current === null) { return; }

    runRenderPipeline(
      context,
      { map: particleMap.current, width: grainSize, height: grainSize },
      [],
      [renderDebugLayer]
    );
  };

  const startNewParticles: PointerEventHandler<HTMLCanvasElement> = (event) => {
    canGenerateParticle = true;

    updateNewParticleCoordinate(event);
  }

  const stopNewParticles: PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (canGenerateParticle) {
      updateNewParticleColor();
    }

    canGenerateParticle = false;
  }

  const updateNewParticleCoordinate: PointerEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / grainSize);
    const row = Math.floor(y / grainSize);

    newParticleCoordinate.row = row;
    newParticleCoordinate.col = col;
  }

  const resetConcoction: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (particleMap?.current === null) { return; }

    canGenerateParticle = false;
    resetParticleMap(particleMap.current);
  }

  const updateNewParticleColor = () => {
    if (!rotateColor) { return; }
    currentHSL.h = (currentHSL.h + DEFAULT_DATA.ColorIncrement) % 360;
  }

  return <div className="flex flex-col w-full h-full gap-2">
    <Canvas
      init={initFn}
      predraw={predrawFn}
      draw={drawFn}
      onResize={onResizeFn}
      onPointerDown={startNewParticles}
      onPointerUp={stopNewParticles}
      onPointerOut={stopNewParticles}
      onPointerMove={updateNewParticleCoordinate}
      debugLayerRenderer={RenderLocation.TopCenter}
      className={className}
    />
    <button className="flex self-center" onClick={resetConcoction}>Reset</button>
  </div>
};

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Sand Sim',
  linkUrl: 'sand-sim',
  title: 'Sand Simulation'
};

export default SandSim;