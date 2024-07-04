import { type RenderFunction, type Size } from "@/utilities/drawing-operations"
import { type OperationFunction } from "@/utilities/misc-operations"
import { type Transition, type TransitionProps } from "@/utilities/transition-operations"
import { type Coordinates } from "@/components/canvas/types"

export enum TagState {
  Normal,
  NewTag,
  NewProps
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

export type TagAllocations = {
  origin: Coordinates,
  allocations: {
    [tagKey: string]: {
      tag: TagValue,
      allocation: AllocatedSpace<string>
    }
  }
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

export type PackedSpace<T> = {
  origin: Coordinates,
  size: Size,
  free: Array<Space>
  allocations: Array<AllocatedSpace<T>>
}

export type Space = {
  location: Coordinates,
  size: Size
}

export interface AllocatedSpace<T> extends Space {
  horizontal: boolean,
  value: T
}