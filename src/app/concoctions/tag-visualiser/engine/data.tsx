import { type HSL } from "@/utilities/drawing-operations"

type EngineData = {
  BaseColor: HSL,
  FontSizes: Array<number>
};

const data: EngineData = {
  BaseColor: { h: 20, s: 67, l: 94 },
  FontSizes: [100, 80, 60, 50, 40, 30, 25, 20, 15, 10]
}

export default data
