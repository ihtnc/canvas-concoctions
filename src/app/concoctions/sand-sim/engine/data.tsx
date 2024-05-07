import { type BorderRadii } from "@/utilities/drawing-operations";
import { type ParticleValue } from "./types";

type EngineData = {
  EmptyParticle: ParticleValue,
  InitialValue: number,
  IncrementValue: number,
  InitialVelocity: number,
  Acceleration: number,
  ParticleShape: BorderRadii,
};

const data: EngineData = {
  EmptyParticle: { value: 0 },
  InitialValue: 1,
  IncrementValue: 0.5,
  InitialVelocity: 1,
  Acceleration: 0.1,
  ParticleShape: { tl: 10, tr: 10, bl: 10, br: 10 }
};

export default data;
