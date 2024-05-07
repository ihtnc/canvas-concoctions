import {
  chooseRandom,
  deepCopy
} from "@/utilities/misc-operations";
import {
  type MatrixValue,
  type MatrixCoordinate,
  PeekDirection,
  peek,
  copy
} from "@/utilities/matrix-operations";
import { type ParticleOperationFunction, type ParticleValue } from "./types";
import { isValueEmpty, isValueUndefinedOrNotEmpty } from "./utilities";
import ENGINE_DATA from './data';

const calculateDistance = (time: number): number => {
  // distance = (initialVelocity * time) + (0.5 * acceleration * time^2)
  const initial = time * ENGINE_DATA.InitialVelocity;
  const accelaration = (0.5 * ENGINE_DATA.Acceleration * time * time);
  return initial + accelaration;
};

const getNextCoordinate = (value: MatrixValue<ParticleValue>, current: MatrixCoordinate): MatrixCoordinate | undefined => {
  let direction: PeekDirection = PeekDirection.Down;
  let retryCount: number = 0;

  while (retryCount < 2) {
    const particleBelow = peek(value, current, direction);
    if (particleBelow === undefined) { return undefined; }

    if (isValueEmpty(particleBelow)) {
      const next: MatrixCoordinate = {
        row: current.row + 1,
        col: current.col
      };

      if (direction == PeekDirection.LowerLeft) { next.col = current.col - 1; }
      else if (direction == PeekDirection.LowerRight) { next.col = current.col + 1; }

      return next;
    }

    const option = chooseRandom(1, 100);
    if (option <= 48) { direction = PeekDirection.LowerLeft; }
    else if (option <= 52) { return undefined; }
    else { direction = PeekDirection.LowerRight; }

    retryCount++;
  }

  return undefined;
};

export const dropParticles: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
  const coordinate: MatrixCoordinate = { row: 0, col: 0 };
  const nextValue = copy(value);

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const currentValue = value[i][j];
      if (isValueEmpty(currentValue)) { continue; }

      coordinate.row = i;
      coordinate.col = j;
      const particleBelow = peek(value, coordinate, PeekDirection.Down);
      if (isValueUndefinedOrNotEmpty(particleBelow)) { continue; }

      const distance = calculateDistance(currentValue.value);
      let actualValue = Math.floor(distance);
      let currentRow = i;
      let currentCol = j;

      const current: MatrixCoordinate = {
        row: currentRow,
        col: currentCol
      };
      while(--actualValue >= 0) {
        const next = getNextCoordinate(value, current);
        if (next === undefined) { break; }
        nextValue[next.row][next.col] = deepCopy(currentValue);
        nextValue[current.row][current.col] = deepCopy(ENGINE_DATA.EmptyParticle);

        current.row = next.row;
        current.col = next.col;
      }
    }
  }
  return nextValue;
};

const getNextValue = (particle: ParticleValue): ParticleValue => {
  const nextValue = deepCopy(particle);
  nextValue.value = nextValue.value + ENGINE_DATA.IncrementValue;
  return deepCopy(nextValue);
};

export const increaseParticleValue: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
  const coordinate: MatrixCoordinate = { row: 0, col: 0 };
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const currentValue = value[i][j];
      if (isValueEmpty(currentValue)) { continue; }

      coordinate.row = i;
      coordinate.col = j;
      const particleBelow = peek(value, coordinate, PeekDirection.Down);
      if (isValueUndefinedOrNotEmpty(particleBelow)) { continue; }

      value[i][j] = getNextValue(currentValue);
    }
  }
  return value;
};
