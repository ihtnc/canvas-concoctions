import { type HSL } from "@/utilities/drawing-operations"

type EngineData = {
  BaseColor: HSL,
  FontSizes: Array<number>
};

const data: EngineData = {
  BaseColor: { h: 20, s: 67, l: 94 },
  FontSizes: [100, 85, 70, 60, 50, 45, 40, 35, 30, 25]
}

export default data
