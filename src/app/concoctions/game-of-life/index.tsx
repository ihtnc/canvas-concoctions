'use client';

import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import {
  type InitRenderHandler,
  type DrawHandler,
  type OnResizeHandler,
  type PreDrawHandler,
  type PostDrawHandler
} from "@/components/canvas/types";
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas";
import { type MatrixCoordinate, type MatrixValue } from "@/utilities/matrix-operations";
import { hexToHSL } from "@/utilities/drawing-operations";
import { type PointerEventHandler, useRef } from "react";
import {
  type CellValue,
  CycleState,
  initialiseCellMap,
  resizeCellMap,
  resetCellMap,
  runCellMapPipeline,
  runCellRenderPipeline,
  getNextCycle,
  isEndPhase
} from "./engine";
import ControlPanel, { type ControlItem } from "@/components/control-panel";
import PlayIcon from "@/components/icons/play-icon";
import PauseIcon from "@/components/icons/pause-icon";
import ForwardIcon from "@/components/icons/forward-icon";
import TrashIcon from "@/components/icons/trash-icon";

type GameOfLifeProps = {
  className?: string,
  cellSize?: number,
  autoStart?: boolean,
  aliveColor?: string,
  dyingColor?: string,
  growingColor?: string
};
type DefaultData = {
  MinCellSize: number,
  MaxCellSize: number,
  DefaultCellSize: number,
  DefaultAutoStart: boolean,
  DefaultAliveColor: string,
  DefaultDyingColor: string,
  DefaultGrowingColor: string
}
enum ButtonType {
  Start,
  Pause,
  Step
}

const DEFAULT_DATA: DefaultData = {
  MinCellSize: 10,
  MaxCellSize: 30,
  DefaultCellSize: 10,
  DefaultAutoStart: true,
  DefaultAliveColor: '#09AB00',
  DefaultDyingColor: '#C0C0C0',
  DefaultGrowingColor: '#0BD100',
}

const GameOfLife = ({
  className,
  cellSize=DEFAULT_DATA.DefaultCellSize,
  autoStart=DEFAULT_DATA.DefaultAutoStart,
  aliveColor=DEFAULT_DATA.DefaultAliveColor,
  dyingColor=DEFAULT_DATA.DefaultDyingColor,
  growingColor=DEFAULT_DATA.DefaultGrowingColor
}: GameOfLifeProps) => {
  const cellMap = useRef<MatrixValue<CellValue> | null>(null);
  const newCellCoordinate: MatrixCoordinate = { row: 0, col: 0 };

  let canGenerateCell: boolean = false;
  let newCellInitiated: boolean = false;

  let cycleState: CycleState = autoStart ? CycleState.Start : CycleState.Stop;
  let lastButtonClicked: ButtonType = autoStart ? ButtonType.Start : ButtonType.Pause;

  if (cellSize < DEFAULT_DATA.MinCellSize) { cellSize = DEFAULT_DATA.MinCellSize; }
  else if (cellSize > DEFAULT_DATA.MaxCellSize) { cellSize = DEFAULT_DATA.MaxCellSize; }

  const aliveHSLProp = hexToHSL(aliveColor);
  const aliveHSL = aliveHSLProp === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultAliveColor)!
    : aliveHSLProp!;

  const dyingHSLProp = hexToHSL(dyingColor);
  const dyingHSL = dyingHSLProp === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultDyingColor)!
    : dyingHSLProp!;

  const growingHSLProp = hexToHSL(growingColor);
  const growingHSL = growingHSLProp === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultGrowingColor)!
    : growingHSLProp!;

  let cycleIndex: number = 0;

  const initFn: InitRenderHandler = (canvas) => {
    const row = Math.floor(canvas.height / cellSize);
    const col = Math.floor(canvas.width / cellSize);
    const map = initialiseCellMap(row, col);
    cellMap.current = map;
  };

  const onResizeFn: OnResizeHandler = (canvas, width, height) => {
    if (cellMap?.current === null) { return; }

    const newRow = Math.floor(height / cellSize);
    const newCol = Math.floor(width / cellSize);

    const newSize = resizeCellMap(cellMap.current, newRow, newCol);
    cellMap.current = newSize;
  };

  const startNewCells: PointerEventHandler<HTMLCanvasElement> = (event) => {
    canGenerateCell = true;
    updateNewCellCoordinate(event);

    if (lastButtonClicked === ButtonType.Start) {
      cycleState = CycleState.Stop;
    }

    newCellInitiated = true;
  }

  const stopNewCells: PointerEventHandler<HTMLCanvasElement> = (event) => {
    canGenerateCell = false;

    if (newCellInitiated && lastButtonClicked === ButtonType.Start) {
      cycleState = CycleState.Start;
    }

    newCellInitiated = false;
  }

  const updateNewCellCoordinate: PointerEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    newCellCoordinate.row = row;
    newCellCoordinate.col = col;
  }

  const predrawFn: PreDrawHandler = (canvas, data) => {
    if (cellMap.current === null) { return; }

    const map = cellMap.current;
    const newMap = runCellMapPipeline(map, cycleIndex, canGenerateCell ? newCellCoordinate : undefined);
    cellMap.current = newMap;
  };

  const drawFn: DrawHandler = ({ context }) => {
    if (cellMap?.current === null) { return; }

    runCellRenderPipeline(
      context,
      {
        map: cellMap.current,
        width: cellSize, height: cellSize,
        aliveColor: aliveHSL, dyingColor: dyingHSL, growingColor: growingHSL,
        cycleIndex
      },
      [],
      []
    );
  };

  const postDrawFn: PostDrawHandler = () => {
    if (lastButtonClicked === ButtonType.Step && isEndPhase(cycleIndex)) {
      cycleState = CycleState.Stop;
    }
    cycleIndex = getNextCycle(cycleIndex, cycleState);
  };

  const startCycle = () => {
    lastButtonClicked = ButtonType.Start;
    cycleState = CycleState.Start;
  }

  const pauseCycle = () => {
    lastButtonClicked = ButtonType.Pause;
    cycleState = CycleState.Stop;
  }

  const stepCycle = () => {
    lastButtonClicked = ButtonType.Step;
    cycleState = CycleState.Start;
  }

  const resetConcoction = () => {
    if (cellMap?.current === null) { return; }

    canGenerateCell = false;
    resetCellMap(cellMap.current);
  }

  const { Canvas } = useAnimatedCanvas({
    init: initFn,
    predraw: predrawFn,
    draw: drawFn,
    postdraw: postDrawFn,
    onResize: onResizeFn
  });

  const hidePlayIcon = (): boolean => {
    return lastButtonClicked === ButtonType.Start;
  };

  const hidePauseIcon = (): boolean => {
    const showNormal = lastButtonClicked === ButtonType.Start;
    return !showNormal;
  }

  const controls: Array<ControlItem> = [{
    type: "button",
    onClickHandler: startCycle,
    content: (<PlayIcon />),
    title: "Start cycle",
    hidden: hidePlayIcon
  }, {
    type: "button",
    onClickHandler: pauseCycle,
    content: (<PauseIcon />),
    title: "Pause cycle",
    hidden: hidePauseIcon
  }, {
    type: "button",
    onClickHandler: stepCycle,
    content: (<ForwardIcon />),
    title: "Forward 1 cycle"
  }, {
    type: "button",
    onClickHandler: resetConcoction,
    content: (<TrashIcon />),
    title: "Reset canvas",
    className: "ml-auto"
  }];

  return <div className="flex flex-col w-full h-full gap-2">
    <Canvas
      className={className}
      onPointerDown={startNewCells}
      onPointerUp={stopNewCells}
      onPointerOut={stopNewCells}
      onPointerMove={updateNewCellCoordinate}
    />
    <ControlPanel controls={controls} className="w-full" />
  </div>
};

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Game of Life',
  linkUrl: 'game-of-life',
  title: 'Game of Life',
  previewUrl: '/previews/game-of-life.gif'
};

export default GameOfLife;