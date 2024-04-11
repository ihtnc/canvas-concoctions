import { type MatrixValue } from "@/utilities/matrix-operations";
import {
  type CellValue,
  type CellOperationFunction,
  type RenderPipelineData,
  type CellRenderFunction,
  CellState,
  CycleState
} from "./engine";

export const setMatrixValue: CellOperationFunction = (value: MatrixValue<CellValue>) => {
  value[0][2] = { state: CellState.Alive };
  value[1][0] = { state: CellState.Alive };
  value[1][2] = { state: CellState.Alive };
  value[2][1] = { state: CellState.Alive };
  value[2][2] = { state: CellState.Alive };

  return value;
};

type RenderDebugObject = {
  cycleState: CycleState,
  buttonState: string
};
type GetRenderDebugLayerFunction = (debug: RenderDebugObject) => CellRenderFunction;
export const getRenderDebugLayer: GetRenderDebugLayerFunction = (debug) => {
  const renderDebug: CellRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
    const { map, width, height, cycleIndex } = data;
    const rowCount = map.length;
    const colCount = map[0].length;
    const lastX = (colCount - 1) * width;
    const lastY = (rowCount - 1) * height;
    const tl = { y: 0, x: 0 };
    const tr = { y: 0, x: lastX };
    const bl = { y: lastY, x: 0 };
    const br = { y: lastY, x: lastX };
    const originalFillStyle = context.fillStyle;

    const { buttonState, cycleState } = debug;
    context.fillStyle = '#000000';
    const matrixSizeText = `map[${rowCount}][${colCount}];`
    const cellSizeText = `size:${width}x${height};`
    const cycleStateText = `state:${CycleState[cycleState]};`;
    const cycleText = `cycle:${cycleIndex};`;
    const buttonStateText = `button:${buttonState};`;
    context.fillText(`${matrixSizeText} ${cellSizeText}`, 30, 10);
    context.fillText(`${buttonStateText} ${cycleStateText} ${cycleText}`, 30, 20);

    context.fillStyle = '#FF0000';
    context.fillRect(tl.x, tl.y, width, height);
    context.fillText(`x=${tl.x}; y=${tl.y}`, tl.x + 30, tl.y + 30);

    context.fillStyle = '#0077FF';
    context.fillRect(tr.x, tr.y, width, height);
    context.fillText(`x=${tr.x}; y=${tr.y}`, tr.x - 50, tr.y + 30);

    context.fillStyle = '#0000FF';
    context.fillRect(bl.x, bl.y, width, height);
    context.fillText(`x=${bl.x}; y=${bl.y}`, bl.x + 30, bl.y - 30);

    context.fillStyle = '#FF00FF';
    context.fillRect(br.x, br.y, width, height);
    context.fillText(`x=${br.x}; y=${br.y}`, br.x - 50, br.y - 30);

    context.fillStyle = originalFillStyle;
  };

  return renderDebug;
};