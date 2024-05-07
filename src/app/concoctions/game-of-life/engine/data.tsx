import { type BorderRadii } from "@/utilities/drawing-operations";
import { type CellValue, CellState } from "./types";

type EngineData = {
  DeadCell: CellValue,
  AliveCell: CellValue,
  CellShape: BorderRadii,
  CycleLength: number,
  StateTransitionLength: number
};

const data: EngineData = {
  DeadCell: { state: CellState.Dead },
  AliveCell: { state: CellState.Alive },
  CellShape: { tl: 10, tr: 10, bl: 10, br: 10 },
  CycleLength: 16,
  StateTransitionLength: 12
};

export default data;
