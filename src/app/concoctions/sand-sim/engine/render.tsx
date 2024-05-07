import {
  type HSL,
  type BorderRadii,
  areHSLsEqual
} from "@/utilities/drawing-operations";
import {
  type MatrixValue,
  type MatrixCoordinate,
  PeekDirection,
  peek
} from "@/utilities/matrix-operations";
import { deepCopy } from "@/utilities/misc-operations";
import { type RenderPipelineData, type ParticleRenderFunction, type ParticleValue } from "./types";
import { isValueUndefinedOrNotEmpty } from "./utilities";
import ENGINE_DATA from './data';

type ParticleColorMap = { color: HSL, particles: Array<MatrixCoordinate> };
const getColorMap = (value: MatrixValue<ParticleValue>): Array<ParticleColorMap> => {
  const sorted: Array<ParticleColorMap> = [];

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      if (value[i][j].color === undefined) { continue; }

      const color = value[i][j].color!;
      let group = sorted.find(item => areHSLsEqual(item.color, color));
      if (group === undefined) {
        const newLength = sorted.push({ color: deepCopy(color), particles: [] })
        group = sorted[newLength - 1];
      }
      group.particles.push({ row: i, col: j });
    }
  }

  return sorted;
};

export const renderParticleLayer: ParticleRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { map, width, height } = data;
  let shape: BorderRadii = { tl: 0, tr: 0, bl: 0, br: 0 };

  context.save();

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

      const particleRadius = [shape.tl, shape.tr, shape.br, shape.bl];
      context.roundRect(col * width, row * height, width, height, particleRadius);
    }

    context.fill();
    context.stroke();
  }

  context.restore();
};
