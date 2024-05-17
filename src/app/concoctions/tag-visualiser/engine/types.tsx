import { type RenderFunction, type HSL } from "@/utilities/drawing-operations"
import { type OperationFunction } from "@/utilities/misc-operations"
import { type Transition, type TransitionProps } from "@/utilities/transition-operations"

export enum TagState {
  Normal,
  NewTag,
  NewRank
}

export type TagValue = {
  value: string,
  rank: number,
  count: number,
  props: TransitionProps,
  targetProps: TransitionProps,
  state: TagState,
  transitions: Array<Transition>
}

export type Tags = { [tag: string]: TagValue };

export type TagOperationData = {
  frame: number,
  tag: TagValue
}
export interface TagOperationFunction extends OperationFunction {
  (value: TagOperationData): TagOperationData
}

export type RenderPipelineData = {
  frame: number,
  tags: Tags
};

export interface TagsRenderFunction extends RenderFunction {
  (context: CanvasRenderingContext2D, data: RenderPipelineData): void;
}
