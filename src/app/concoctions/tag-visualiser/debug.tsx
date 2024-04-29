import { type RenderPipelineData, type TagsRenderFunction } from "./engine/types";

export const renderDebugLayer: TagsRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { tags } = data;
  context.save();

  context.fillStyle = '#000000';

  const list: Array<{ tag: string, rank: number }> = [];
  for (let t in tags) {
    const { value, rank } = tags[t];
    list.push({ tag: value, rank });
  }
  list.sort((a, b) => { return a.rank - b.rank; });

  let x = 10;
  let y = 10;
  context.beginPath();
  for (let t in list) {
    const tag = tags[list[t].tag];

    const name = `${tag.value}: ${tag.count};`;

    let transitions = tag.transitions.map(t => t.id).join(',');
    transitions = tag.transitions.length > 0 ? `transitions: ${transitions};` : '';

    const text = `[${tag.rank}] ${name} ${transitions}`;
    context.fillText(text, x, y);
    y += 10;
  }

  context.restore();
};