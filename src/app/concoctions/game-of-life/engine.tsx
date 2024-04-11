import {
  type RenderFunction,
  type HSL,
  type BorderRadii,
  runRenderPipeline
} from "@/utilities/drawing-operations";
import {
  type MatrixValue,
  type MatrixCoordinate,
  type MatrixOperationFunction,
  VResizeDirection,
  HResizeDirection,
  PeekDirection,
  initialise,
  resize,
  reset,
  matrixPipeline,
  copy,
  peek
} from "@/utilities/matrix-operations";
import { deepCopy } from "@/utilities/misc-operations";

export enum CycleState {
  Start,
  Stop
}

export enum CellState {
  Alive,
  Dying,
  Dead,
  Growing
};
export type CellValue = { state: CellState };

type EngineData = {
  DeadCell: CellValue,
  AliveCell: CellValue,
  CellShape: BorderRadii,
  CycleLength: number,
  StateTransitionLength: number
};
const ENGINE_DATA: EngineData = {
  DeadCell: { state: CellState.Dead },
  AliveCell: { state: CellState.Alive },
  CellShape: { tl: 10, tr: 10, bl: 10, br: 10 },
  CycleLength: 20,
  StateTransitionLength: 5
};

const isCellUndefinedOrTechnicallyAlive = (cell: CellValue | undefined): boolean => {
  return cell === undefined || isCellTechnicallyAlive(cell);
}

const isCellTechnicallyAlive = (cell: CellValue): boolean => {
  return cell.state === CellState.Alive || cell.state === CellState.Dying;
}

export interface CellOperationFunction extends MatrixOperationFunction {
  (value: MatrixValue<CellValue>): MatrixValue<CellValue>
}

type InitialiseCellMapFunction = (row: number, col: number) => MatrixValue<CellValue>;
export const initialiseCellMap: InitialiseCellMapFunction = (row, col) => {
  return initialise(row, col, ENGINE_DATA.DeadCell);
};

type ResizeCellMapFunction = (value: MatrixValue<CellValue>, newRow: number, newCol: number) => MatrixValue<CellValue>;
export const resizeCellMap: ResizeCellMapFunction = (value, newRow, newCol) => {
  return resize(value, newRow, newCol, ENGINE_DATA.DeadCell, VResizeDirection.Down, HResizeDirection.Right);
};

export const resetCellMap: CellOperationFunction = (value: MatrixValue<CellValue>) => {
  return reset(value, ENGINE_DATA.DeadCell);
}

const normaliseCycleIndex = (cycleIndex: number) => {
  return (cycleIndex % ENGINE_DATA.CycleLength) + 1;
}
export const isDormantPhase = (cycleIndex: number): boolean => {
  const checkIndex = ENGINE_DATA.CycleLength - ENGINE_DATA.StateTransitionLength;
  const index = normaliseCycleIndex(cycleIndex);
  return index < checkIndex;
}
export const isCheckStatePhase  = (cycleIndex: number): boolean => {
  const dormantLength = ENGINE_DATA.CycleLength - ENGINE_DATA.StateTransitionLength;
  return normaliseCycleIndex(cycleIndex) === dormantLength;
}
export const isTransitionPhase = (cycleIndex: number): boolean => {
  const checkIndex = ENGINE_DATA.CycleLength - ENGINE_DATA.StateTransitionLength;
  const index = normaliseCycleIndex(cycleIndex);
  return index > checkIndex && index < ENGINE_DATA.CycleLength;
}
export const isEndPhase = (cycleIndex: number): boolean => {
  return normaliseCycleIndex(cycleIndex) === ENGINE_DATA.CycleLength;
}
export const getCycleProgress = (cycleIndex: number): number => {
  return normaliseCycleIndex(cycleIndex) / ENGINE_DATA.CycleLength;
};

type GetNextCycleFunction = (cycleIndex: number, state: CycleState) => number;
export const getNextCycle: GetNextCycleFunction = (cycleIndex, state) => {
  if (isTransitionPhase(cycleIndex)) { return cycleIndex + 1; }
  if (state === CycleState.Stop) { return 0; }

  return isEndPhase(cycleIndex) ? 0 : cycleIndex + 1;
}

type GenerateCellsFunction = (value: MatrixValue<CellValue>, coordinate: MatrixCoordinate) => MatrixValue<CellValue>;
const generateCells: GenerateCellsFunction = (value, coordinate) => {
  const { row, col } = coordinate;
  if (row >= value.length) { return value; }
  if (col >= value[row].length) { return value; }

  value[row][col] = deepCopy(ENGINE_DATA.AliveCell);
  return value;
};

const getTransitionCellState: (value: MatrixValue<CellValue>, coordinate: MatrixCoordinate) => CellValue  = (value, coordinate) => {
  const neighbors: Array<CellValue | undefined> = [
    peek(value, coordinate, PeekDirection.UpperLeft),
    peek(value, coordinate, PeekDirection.Up),
    peek(value, coordinate, PeekDirection.UpperRight),
    peek(value, coordinate, PeekDirection.Left),
    peek(value, coordinate, PeekDirection.Right),
    peek(value, coordinate, PeekDirection.LowerLeft),
    peek(value, coordinate, PeekDirection.Down),
    peek(value, coordinate, PeekDirection.LowerRight)
  ];

  const { row, col } = coordinate;
  let current = deepCopy(value[row][col]);
  const alive = neighbors.filter(c => c !== undefined && c.state === CellState.Alive);

  const shouldDie = alive.length < 2 || alive.length > 3;
  const shouldGrow = alive.length === 3;

  if (current.state === CellState.Alive && shouldDie) {
    current.state = CellState.Dying;
  } else if (current.state === CellState.Dead && shouldGrow) {
    current.state = CellState.Growing;
  }

  return current;
}

const setTransitionCellStates: (value: MatrixValue<CellValue>) => MatrixValue<CellValue> = (value) => {
  const next = copy(value);

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      next[i][j] = getTransitionCellState(value, { row: i, col: j });
    }
  }

  return next;
}

const finaliseTransitionCellStates: (value: MatrixValue<CellValue>) => MatrixValue<CellValue> = (value) => {
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const current = value[i][j];
      if (current.state === CellState.Dying) {
        current.state = CellState.Dead;
      } else if (current.state === CellState.Growing) {
        current.state = CellState.Alive;
      }
    }
  }

  return value;
}

type RunCellMapPipelineFunction = (value: MatrixValue<CellValue>, cycleIndex: number, newCell?: MatrixCoordinate) => MatrixValue<CellValue>;
export const runCellMapPipeline: RunCellMapPipelineFunction = (value, cycleIndex, newCell) => {
  const addNewCellsOnDormantPhase: CellOperationFunction = (value: MatrixValue<CellValue>) => {
    return isDormantPhase(cycleIndex) && newCell !== undefined
      ? generateCells(value, newCell)
      : value;
  };

  const setTransitionStateOnCheckStatePhase: CellOperationFunction = (value: MatrixValue<CellValue>) => {
    return isCheckStatePhase(cycleIndex)
      ? setTransitionCellStates(value)
      : value;
  };

  const finaliseStateOnEndPhase: CellOperationFunction = (value: MatrixValue<CellValue>) => {
    return isEndPhase(cycleIndex)
      ? finaliseTransitionCellStates(value)
      : value;
  }

  const newValue = matrixPipeline([
    copy,
    addNewCellsOnDormantPhase,
    setTransitionStateOnCheckStatePhase,
    finaliseStateOnEndPhase
  ]).run(value);

  return newValue;
}

export type RenderPipelineData = {
  map: MatrixValue<CellValue>,
  width: number,
  height: number,
  aliveColor: HSL,
  dyingColor: HSL,
  growingColor: HSL,
  cycleIndex: number
};

export interface CellRenderFunction extends RenderFunction {
  (context: CanvasRenderingContext2D, data: RenderPipelineData): void;
}

type CellStateMap = { state: CellState, cells: Array<MatrixCoordinate> };
type GetStateMapFunction = (value: MatrixValue<CellValue>) => Array<CellStateMap>;
const getStateMap: GetStateMapFunction = (value): Array<CellStateMap> => {
  const sorted: Array<CellStateMap> = [];

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const state = value[i][j].state;
      let group = sorted.find(item => item.state === state);
      if (group === undefined) {
        const newLength = sorted.push({ state, cells: [] })
        group = sorted[newLength - 1];
      }
      group.cells.push({ row: i, col: j });
    }
  }

  return sorted;
};

type CellDisplayMap = {
  state: CellState,
  color: HSL,
  opacity: number,
  width: number, height:
  number, cells: Array<MatrixCoordinate>
};
type GetDisplayMapFunction = (stateMap: Array<CellStateMap>, cycleIndex: number, width: number, height: number, aliveColor: HSL, dyingColor: HSL, growingColor: HSL) => Array<CellDisplayMap>;
const getDisplayMap: GetDisplayMapFunction = (stateMap, cycleIndex, width: number, height: number, aliveColor, dyingColor, growingColor): Array<CellDisplayMap> => {
  const sorted: Array<CellDisplayMap> = [];
  const cycleProgress = getCycleProgress(cycleIndex);

  for (let i = 0; i < stateMap.length; i++) {
    if (stateMap[i].state === CellState.Dead) { continue; }

    let color: HSL;
    let cellWidth: number;
    let cellHeight: number;
    let opacity: number;
    const state = stateMap[i].state;
    switch (state) {
      case CellState.Dying:
        const dyingProgress = 1 - cycleProgress;
        color = deepCopy(dyingColor);
        color.s = color.s * dyingProgress;
        opacity = dyingProgress;
        cellWidth = width * dyingProgress;
        cellHeight = height * dyingProgress;
        break;
      case CellState.Growing:
        const growingProgress = cycleProgress;
        color = deepCopy(growingColor);
        color.s = color.s * growingProgress;
        opacity = growingProgress;
        cellWidth = width * growingProgress;
        cellHeight = height * growingProgress;
        break;
      default:
        color = deepCopy(aliveColor);
        opacity = 1;
        cellWidth = width;
        cellHeight = width;
        break;
    }

    const group: CellDisplayMap = {
      state,
      color,
      opacity,
      width: cellWidth,
      height: cellHeight,
      cells: []
    };
    for (let j = 0; j < stateMap[i].cells.length; j++) {
      group.cells.push(stateMap[i].cells[j]);
    }

    sorted.push(group);
  }

  return sorted;
};

const getCellShape: (map: MatrixValue<CellValue>, coordinate: MatrixCoordinate, cycleIndex: number) => BorderRadii = (map, coordinate, cycleIndex) => {
  const { row, col } = coordinate;
  const shape = deepCopy(ENGINE_DATA.CellShape);

  const cellTopLeft = peek(map, { row, col }, PeekDirection.UpperLeft);
  if (isCellUndefinedOrTechnicallyAlive(cellTopLeft)) {
    shape.tl = 0;
  }

  const cellAbove = peek(map, { row, col }, PeekDirection.Up);
  if (isCellUndefinedOrTechnicallyAlive(cellAbove)) {
    shape.tl = 0;
    shape.tr = 0;
  }

  const cellTopRight = peek(map, { row, col }, PeekDirection.UpperRight);
  if (isCellUndefinedOrTechnicallyAlive(cellTopRight)) {
    shape.tr = 0;
  }

  const cellLeft = peek(map, { row, col }, PeekDirection.Left);
  if (isCellUndefinedOrTechnicallyAlive(cellLeft)) {
    shape.tl = 0;
    shape.bl = 0;
  }

  const cellRight = peek(map, { row, col }, PeekDirection.Right);
  if (isCellUndefinedOrTechnicallyAlive(cellRight)) {
    shape.tr = 0;
    shape.br = 0;
  }

  const cellBottomLeft = peek(map, { row, col }, PeekDirection.LowerLeft);
  if (isCellUndefinedOrTechnicallyAlive(cellBottomLeft)) {
    shape.bl = 0;
  }

  const cellBelow = peek(map, { row, col }, PeekDirection.Down);
  if (isCellUndefinedOrTechnicallyAlive(cellBelow)) {
    shape.bl = 0;
    shape.br = 0;
  }

  const cellBottomRight = peek(map, { row, col }, PeekDirection.LowerRight);
  if (isCellUndefinedOrTechnicallyAlive(cellBottomRight)) {
    shape.br = 0;
  }

  return shape;
};

const renderCellLayer: CellRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { map, width, height, cycleIndex, aliveColor, dyingColor, growingColor } = data;

  const originalFillStyle = context.fillStyle;
  const originalStrokeStyle = context.strokeStyle;

  const stateMap = getStateMap(map);
  const displayMap = getDisplayMap(
    stateMap,
    cycleIndex,
    width, height,
    aliveColor, dyingColor, growingColor
  );
  for(let g = 0; g < displayMap.length; g++) {
    const group = displayMap[g];

    const { h, s, l } = group.color;
    const color = `HSLA(${h}, ${s}%, ${l}%, ${group.opacity})`;

    context.beginPath();
    context.fillStyle = color;
    context.strokeStyle = color;

    for(let i = 0; i < group.cells.length; i++) {
      const { row, col } = group.cells[i];
      const cellShape = getCellShape(map, { row, col }, cycleIndex);
      const cellRadius = [cellShape.tl, cellShape.tr, cellShape.br, cellShape.bl];
      const xOffset = Math.floor((width - group.width) / 2);
      const yOffset = Math.floor((height - group.height) / 2);
      const x = (col * width) + xOffset;
      const y = (row * height) + yOffset;
      context.roundRect(x, y, width, height, cellRadius);
    }

    context.fill();
    context.stroke();
  }

  context.fillStyle = originalFillStyle;
  context.strokeStyle = originalStrokeStyle;
};

type RunCellRenderPipelineFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const runCellRenderPipeline: RunCellRenderPipelineFunction = (context, data, pre, post) => {
  runRenderPipeline(context, data, renderCellLayer, pre, post);
};
