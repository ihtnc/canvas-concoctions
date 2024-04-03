import {
  chooseRandom,
  deepCopy
} from "@/utilities/misc-operations";
import {
  type HSL,
  compareHSL
} from "@/utilities/drawing-operations";
import {
  VResizeDirection,
  PeekDirection,
  type MatrixValue,
  type MatrixCoordinate,
  type MatrixOperationFunction,
  peek,
  copy,
  initialise,
  resize,
  matrixPipeline,
  reset
} from "@/utilities/matrix-operations";

export type ParticleValue = { color?: HSL, value: number };

type BorderRadii = { tl: number, tr: number, bl: number, br: number };

type EngineData = {
  EmptyParticle: ParticleValue,
  InitialValue: number,
  IncrementValue: number,
  InitialVelocity: number,
  Acceleration: number,
  ParticleShape: BorderRadii,
};
const ENGINE_DATA: EngineData = {
  EmptyParticle: { value: 0 },
  InitialValue: 1,
  IncrementValue: 0.5,
  InitialVelocity: 1,
  Acceleration: 0.1,
  ParticleShape: { tl: 10, tr: 10, bl: 10, br: 10 }
};

export interface ParticleOperationFunction extends MatrixOperationFunction {
  (value: MatrixValue<ParticleValue>): MatrixValue<ParticleValue>
}

const isValueUndefinedOrNotEmpty = (particle?: ParticleValue): boolean => {
  return particle === undefined || !isValueEmpty(particle);
}

const isValueEmpty = (particle: ParticleValue): boolean => {
  return particle.color === undefined || particle.value === ENGINE_DATA.EmptyParticle.value;
}

const getNextValue = (particle: ParticleValue): ParticleValue => {
  const nextValue = deepCopy(particle);
  nextValue.value = nextValue.value + ENGINE_DATA.IncrementValue;
  return deepCopy(nextValue);
};

type InitialiseParticleMapFunction = (row: number, col: number) => MatrixValue<ParticleValue>;
export const initialiseParticleMap: InitialiseParticleMapFunction = (row, col) => {
  return initialise(row, col, ENGINE_DATA.EmptyParticle);
};

type ResizeParticleMapFunction = (value: MatrixValue<ParticleValue>, newRow: number, newCol: number) => MatrixValue<ParticleValue>;
export const resizeParticleMap: ResizeParticleMapFunction = (value, newRow, newCol) => {
  return resize(value, newRow, newCol, ENGINE_DATA.EmptyParticle, VResizeDirection.Up, undefined);
};

export const resetParticleMap: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
  return reset(value, ENGINE_DATA.EmptyParticle);
}

type GenerateParticlesFunction = (value: MatrixValue<ParticleValue>, color: HSL, coordinate: MatrixCoordinate) => MatrixValue<ParticleValue>;
const generateParticles: GenerateParticlesFunction = (value, color, coordinate) => {
  const { row, col } = coordinate;
  if (row >= value.length) { return value; }
  if (col >= value[row].length) { return value; }

  value[row][col] = {
    color: deepCopy(color),
    value: ENGINE_DATA.InitialValue
  };
  return value;
};

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

const dropParticles: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
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

const increaseParticleValue: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
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

type RunParticleMapPipelineFunction = (value: MatrixValue<ParticleValue>, color: HSL, newParticle?: MatrixCoordinate) => MatrixValue<ParticleValue>;
export const runParticleMapPipeline: RunParticleMapPipelineFunction = (value, color, newParticle) => {
  const addNewParticles: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
    return newParticle === undefined
        ? value
        : generateParticles(value, color, newParticle);
  };

  const newValue = matrixPipeline([
    copy,
    addNewParticles,
    dropParticles,
    increaseParticleValue
  ]).run(value);

  return newValue;
}

type RenderPipelineData = {
  map: MatrixValue<ParticleValue>,
  width: number,
  height: number,
};
export type RenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => void;

type ParticleColorMap = { color: HSL, particles: Array<MatrixCoordinate> };
const getColorMap = (value: MatrixValue<ParticleValue>): Array<ParticleColorMap> => {
  const sorted: Array<ParticleColorMap> = [];

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      if (value[i][j].color === undefined) { continue; }

      const color = value[i][j].color!;
      let group = sorted.find(item => compareHSL(item.color, color));
      if (group === undefined) {
        const newLength = sorted.push({ color: deepCopy(color), particles: [] })
        group = sorted[newLength - 1];
      }
      group.particles.push({ row: i, col: j });
    }
  }

  return sorted;
};

const renderParticleLayer: RenderFunction = (context, data) => {
  const { map, width, height } = data;
  let shape: BorderRadii = { tl: 0, tr: 0, bl: 0, br: 0 };

  const originalFillStyle = context.fillStyle;
  const originalStrokeStyle = context.strokeStyle;

  const colorMap = getColorMap(map);
  for(let g = 0; g < colorMap.length; g++) {
    const group = colorMap[g];

    const { h, s, l } = group.color;
    const color = `HSL(${h}, ${s}%, ${l}%)`;

    context.beginPath();
    context.fillStyle = color;
    context.strokeStyle = color;

    for(let i = 0; i < group.particles.length; i++) {
      const { row, col } = group.particles[i];
      shape.tl = ENGINE_DATA.ParticleShape.tl;
      shape.tr = ENGINE_DATA.ParticleShape.tr;
      shape.bl = ENGINE_DATA.ParticleShape.bl;
      shape.br = ENGINE_DATA.ParticleShape.br;

      const particleAbove = peek(map, { row, col }, PeekDirection.Up);
      if (isValueUndefinedOrNotEmpty(particleAbove)) {
        shape.tl = 0;
        shape.tr = 0;
      }

      const particleBelow = peek(map, { row, col }, PeekDirection.Down);
      if (isValueUndefinedOrNotEmpty(particleBelow)) {
        shape.bl = 0;
        shape.br = 0;
      }

      const particleRadius = [shape.tl, shape.tr, shape.bl, shape.br];
      context.roundRect(col * width, row * height, width, height, particleRadius);
    }

    context.fill();
    context.stroke();
  }

  context.fillStyle = originalFillStyle;
  context.strokeStyle = originalStrokeStyle;
};

const renderPipeline = (pipeline: Array<RenderFunction>) => {
  return {
    run: (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
      for (let i = 0; i < pipeline.length; i++) {
        pipeline[i](context, data);
      }
    }
  };
};

type RunRenderPipelineFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const runRenderPipeline: RunRenderPipelineFunction = (context, data, pre, post) => {
  const pipeline: Array<RenderFunction> = [];
  if (pre) { pipeline.push(...pre); }
  pipeline.push(renderParticleLayer);
  if (post) { pipeline.push(...post); }

  renderPipeline(pipeline).run(context, data);
};