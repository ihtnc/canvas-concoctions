import { type Size } from "@/utilities/drawing-operations"
import { type Transition, type TransitionProps } from "@/utilities/transition-operations"
import { type Coordinates } from "@ihtnc/use-animated-canvas"

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

export type PageData = {
  tags: Tags,

  existingHues: Array<number>,
  spaceAllocation: TagAllocations,

  gridSize: number,
  height: number,
  width: number,

  newTagValue: string,
  addTag: boolean,
  resetTags: boolean,
  resize: boolean,

  getTextSize: GetTextSizeFunction
};

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

export type GetTextSizeFunction = (text: string, fontSize: number) => Size