import { type Coordinates } from "@ihtnc/use-animated-canvas"
import { areSizesEqual, type Size } from "@/utilities/drawing-operations"
import { type AreEqualFunction, deepCopy } from "@/utilities/misc-operations"
import { type AllocatedSpace, type PackedSpace, type Space } from "./types"
import { areCoordinatesEqual } from "@/components/canvas/utilities"

export const areAllocatedSpaceEqual: AreEqualFunction<AllocatedSpace<string>> = (allocation1, allocation2): boolean => {
  if (allocation1?.horizontal !== allocation2?.horizontal) { return false }
  if (areCoordinatesEqual(allocation1?.location, allocation2?.location) === false) { return false }
  if (areSizesEqual(allocation1?.size, allocation2?.size) === false) { return false }
  if (allocation1?.value !== allocation2?.value) { return false }

  return true
}

type InitialiseSpaceFunction = <T>(origin: Coordinates, itemSize: Size, itemValue: T) => PackedSpace<T>
export const initialiseSpace: InitialiseSpaceFunction = (origin, itemSize, itemValue) => {
  const free = [{
    location: { x: 0, y: 0 },
    size: deepCopy(itemSize)
  }]

  const space: PackedSpace<typeof itemValue> = { origin, size: deepCopy(itemSize), free, allocations: [] }
  allocateSpace(space, itemSize, itemValue)

  return space
}

type ExpandSpaceFunction = <T>(space: PackedSpace<T>, amount: number) => PackedSpace<T>
export const expandSpaceLeft: ExpandSpaceFunction = (space, amount) => {
  const { origin, free, size, allocations } = space
  const { width, height } = size

  // sort free spaces on the leftmost side by location
  const freeSpaces = space.free
    .filter(({ location }) => location.x === 0)
    .sort((a, b) => a.location.y - b.location.y)

  // shift space to the left
  origin.x -= amount

  // increase space width
  size.width = width + amount

  // shift allocations to the right
  for(let i = 0; i < allocations.length; i++) {
    const { location } = allocations[i]
    location.x += amount
  }

  // shift other free spaces to the right
  const otherFreeSpaces = free.filter(({ location }) => location.x > 0)
  for(let i = 0; i < otherFreeSpaces.length; i++) {
    const { location } = otherFreeSpaces[i]
    location.x += amount
  }

  let totalHeight = 0
  for(let i = 0; i < freeSpaces.length; i++) {
    // increase width of free spaces on the leftmost side
    freeSpaces[i].size.width += amount

    let currentStart = freeSpaces[i].location.y
    const expectedStart = totalHeight

    // fill gaps between these free spaces
    if (currentStart > expectedStart) {
      const gapHeight = currentStart - expectedStart
      free.push({
        location: { x: 0, y: totalHeight },
        size: { width: amount, height: gapHeight }
      })
      totalHeight += gapHeight
    }

    totalHeight += freeSpaces[i].size.height
  }

  // fill missing gap at the bottom
  if (totalHeight < height) {
    const gapHeight = height - totalHeight
    free.push({
      location: { x: 0, y: totalHeight },
      size: { width: amount, height: gapHeight }
    })
  }

  return space
}

export const expandSpaceRight: ExpandSpaceFunction = (space, amount) => {
  const { free, size } = space
  const { width, height } = size

  // sort free spaces on the rightmost side by location
  const freeSpaces = space.free
    .filter(({ location, size }) => location.x + size.width === space.size.width)
    .sort((a, b) => a.location.y - b.location.y)

  // increase space width
  size.width = width + amount

  let totalHeight = 0
  for(let i = 0; i < freeSpaces.length; i++) {
    // increase width of free spaces on the rightmost side
    freeSpaces[i].size.width += amount

    let currentStart = freeSpaces[i].location.y
    const expectedStart = totalHeight

    // fill gaps between these free spaces
    if (currentStart > expectedStart) {
      const gapHeight = currentStart - expectedStart
      free.push({
        location: { x: width, y: totalHeight },
        size: { width: amount, height: gapHeight }
      })
      totalHeight += gapHeight
    }

    totalHeight += freeSpaces[i].size.height
  }

  // fill missing gap at the bottom
  if (totalHeight < height) {
    const gapHeight = height - totalHeight
    free.push({
      location: { x: width, y: totalHeight },
      size: { width: amount, height: gapHeight }
    })
  }

  return space
}

export const expandSpaceTop: ExpandSpaceFunction = (space, amount) => {
  const { origin, free, size, allocations } = space
  const { width, height } = size

  // sort free spaces on the topmost side by location
  const freeSpaces = space.free
    .filter(({ location }) => location.y === 0)
    .sort((a, b) => a.location.x - b.location.x)

  // shift space up
  origin.y -= amount

  // increase space height
  size.height = height + amount

  // shift allocations down
  for(let i = 0; i < allocations.length; i++) {
    const { location } = allocations[i]
    location.y += amount
  }

  // shift other free spaces down
  const otherFreeSpaces = free.filter(({ location }) => location.y > 0)
  for(let i = 0; i < otherFreeSpaces.length; i++) {
    const { location } = otherFreeSpaces[i]
    location.y += amount
  }

  let totalWidth = 0
  for(let i = 0; i < freeSpaces.length; i++) {
    // increase height of free spaces on the topmost side
    freeSpaces[i].size.height += amount

    let currentStart = freeSpaces[i].location.x
    const expectedStart = totalWidth

    // fill gaps between these free spaces
    if (currentStart > expectedStart) {
      const gapWidth = currentStart - expectedStart
      free.push({
        location: { x: totalWidth, y: 0 },
        size: { width: gapWidth, height: amount }
      })
      totalWidth += gapWidth
    }

    totalWidth += freeSpaces[i].size.width
  }

  // fill missing gap at the right
  if (totalWidth < width) {
    const gapWidth = width - totalWidth
    free.push({
      location: { x: totalWidth, y: 0 },
      size: { width: gapWidth, height: amount }
    })
  }

  return space
}

export const expandSpaceBottom: ExpandSpaceFunction = (space, amount) => {
  const { free, size } = space
  const { width, height } = size

  // sort free spaces on the bottommost side by location
  const freeSpaces = space.free
    .filter(({ location, size }) => location.y + size.height === space.size.height)
    .sort((a, b) => a.location.x - b.location.x)

  // increase space height
  size.height = height + amount

  let totalWidth = 0
  for(let i = 0; i < freeSpaces.length; i++) {
    // increase height of free spaces on the bottommost side
    freeSpaces[i].size.height += amount

    let currentStart = freeSpaces[i].location.x
    const expectedStart = totalWidth

    // fill gaps between these free spaces
    if (currentStart > expectedStart) {
      const gapWidth = currentStart - expectedStart
      free.push({
        location: { x: totalWidth, y: height },
        size: { width: gapWidth, height: amount }
      })
      totalWidth += gapWidth
    }

    totalWidth += freeSpaces[i].size.width
  }

  // fill missing gap at the right
  if (totalWidth < width) {
    const gapWidth = width - totalWidth
    free.push({
      location: { x: totalWidth, y: height },
      size: { width: gapWidth, height: amount }
    })
  }

  return space
}

type AllocateSpaceFunction = <T>(space: PackedSpace<T>, itemSize: Size, itemValue: T) => AllocatedSpace<T> | undefined
export const allocateSpace: AllocateSpaceFunction = (space, itemSize, itemValue) => {
  const freeSpace = allocateFreeSpace(space, itemSize, true)
  if (freeSpace === undefined) { return undefined }

  const centerX = space.size.width / 2
  const centerY = space.size.height / 2
  const horizontal = freeSpace.size.width >= itemSize.width
  const orientatedHeight = horizontal ? itemSize.height : itemSize.width
  const orientatedWidth = horizontal ? itemSize.width : itemSize.height
  const location = deepCopy(freeSpace.location)

  if (freeSpace.location.x + freeSpace.size.width < centerX) {
    location.x = freeSpace.location.x + freeSpace.size.width - orientatedWidth
  }

  if (freeSpace.location.y + freeSpace.size.height < centerY) {
    location.y = freeSpace.location.y + freeSpace.size.height - orientatedHeight
  }

  const allocation: AllocatedSpace<typeof itemValue> = {
    location,
    size: deepCopy(itemSize),
    horizontal,
    value: itemValue
  }

  space.free.splice(space.free.indexOf(freeSpace), 1)
  const remainingSpaces = getRemainingSpaces(freeSpace, allocation)
  space.free.push(...remainingSpaces)
  space.allocations.push(allocation)

  return allocation
}

const allocateFreeSpace: <T>(space: PackedSpace<T>, itemSize: Size, expandSpace: boolean) => Space | undefined = (space, itemSize, expandSpace) => {
  const canFitHorizontal = space.size.width >= itemSize.width && space.size.height >= itemSize.height
  const canFitVertical = space.size.width >= itemSize.height && space.size.height >= itemSize.width
  if (!expandSpace && !canFitHorizontal && !canFitVertical) { return undefined }

  const freeHorizontalSpace = findFreeHorizontalSpace(space, itemSize)
  const freeVerticalSpace = findFreeVerticalSpace(space, itemSize)
  if (!expandSpace && freeHorizontalSpace === undefined && freeVerticalSpace === undefined) { return undefined }

  let freeSpace: Space | undefined
  if (freeHorizontalSpace !== undefined && freeVerticalSpace !== undefined) {
    const itemArea = itemSize.width * itemSize.height
    const horizontalGap = freeHorizontalSpace.size.width * freeHorizontalSpace.size.height - itemArea
    const verticalGap = freeVerticalSpace.size.width * freeVerticalSpace.size.height - itemArea

    // pick the space with the smallest resulting gap
    let chooseHorizontal = verticalGap > horizontalGap
    freeSpace = chooseHorizontal ? freeHorizontalSpace : freeVerticalSpace
  } else {
    freeSpace = freeHorizontalSpace ?? freeVerticalSpace
  }

  // if nothing fits, expand space to all directions until a free space does
  while (freeSpace === undefined) {
    space = expandSpaceLeft(space, 1)
    space = expandSpaceRight(space, 1)
    space = expandSpaceTop(space, 1)
    space = expandSpaceBottom(space, 1)

    freeSpace = allocateFreeSpace(space, itemSize, false)
  }

  return freeSpace
}

type FindFreeSpaceFunction = <T>(space: PackedSpace<T>, itemSize: Size, findSmallest?: boolean) => Space | undefined
export const findFreeHorizontalSpace: FindFreeSpaceFunction = (space, itemSize) => {
  const freeSpacesByWidth = space.free
    .filter(({ size }) => size.width >= itemSize.width)
    .sort((a, b) => {
      const increasingWidth = a.size.width <= b.size.width ? -1 : 1
      const increasingY = a.location.y <= b.location.y ? -1 : 1
      const allocationIndex = space.allocations.length % 5
      if (allocationIndex === 0) { return increasingWidth }

      const sortY = allocationIndex === 1 || allocationIndex === 3 ? increasingY : increasingY * -1
      return sortY
    })

  for(let i = 0; i < freeSpacesByWidth.length; i++) {
    const { size } = freeSpacesByWidth[i]
    const canfit = size.width >= itemSize.width && size.height >= itemSize.height
    if (!canfit) { continue }

    return freeSpacesByWidth[i]
  }

  return undefined
}

export const findFreeVerticalSpace: FindFreeSpaceFunction = (space, itemSize) => {
  const freeSpacesByHeight = space.free
    .filter(({ size }) => size.height >= itemSize.height)
    .sort((a, b) => {
      const increasingHeight = a.size.height <= b.size.height ? -1 : 1
      const increasingX = a.location.x <= b.location.x ? -1 : 1
      const allocationIndex = space.allocations.length % 5
      if (allocationIndex === 0) { return increasingHeight }

      const sortX = allocationIndex === 1 || allocationIndex === 3 ? increasingX : increasingX * -1
      return sortX
    })

  for(let i = 0; i < freeSpacesByHeight.length; i++) {
    const { size } = freeSpacesByHeight[i]
    const canfit = size.width >= itemSize.height && size.height >= itemSize.width
    if (!canfit) { continue }

    return freeSpacesByHeight[i]
  }

  return undefined
}

type GetRemainingSpacesFunction = <T>(space: Space, allocation: AllocatedSpace<T>) => Array<Space>
export const getRemainingSpaces: GetRemainingSpacesFunction = (space, allocation) => {
  const { location, size, horizontal } = allocation
  const { x, y } = location
  const { width, height } = size

  const orientatedHeight = horizontal ? height : width
  const orientatedWidth = horizontal ? width : height

  if (x < space.location.x || x + orientatedWidth > space.location.x + space.size.width
    || y < space.location.y || y + orientatedHeight > space.location.y + space.size.height) {
    return []
  }

  const remainingSpaces: Array<Space> = []
  const hasLeftEdgeGap = x > space.location.x
  const hasRightEdgeGap = x + orientatedWidth < space.location.x + space.size.width
  const hasTopEdgeGap = y > space.location.y
  const hasBottomEdgeGap = y + orientatedHeight < space.location.y + space.size.height

  if (hasLeftEdgeGap) {
    // if item has a gap from the left edge
    // add available space between the left of item and the left edge
    const leftEdgeSpace = {
      location: { x: space.location.x, y },
      size: { width: x - space.location.x, height: orientatedHeight }
    }
    remainingSpaces.push(leftEdgeSpace)

    // also take into consideration a potential space from the top and bottom edge
    if (!horizontal && (hasTopEdgeGap || hasBottomEdgeGap)) {
      leftEdgeSpace.location.y = space.location.y
      leftEdgeSpace.size.height = space.size.height
    }
  }

  if (hasRightEdgeGap) {
    // if item has a gap from the right edge
    // add available space between the right of item and the right edge
    const rightEdgeSpace = {
      location: { x: x + orientatedWidth, y },
      size: { width: space.location.x + space.size.width - x - orientatedWidth, height: orientatedHeight }
    }
    remainingSpaces.push(rightEdgeSpace)

    // also take into consideration a potential space from the top and bottom edge
    if (!horizontal && (hasTopEdgeGap || hasBottomEdgeGap)) {
      rightEdgeSpace.location.y = space.location.y
      rightEdgeSpace.size.height = space.size.height
    }
  }

  if (hasTopEdgeGap) {
    // if item has a gap from the top edge
    // add available space between the top of item and the top edge
    const topEdgeSpace = {
      location: { x, y: space.location.y },
      size: { width: orientatedWidth, height: y - space.location.y }
    }
    remainingSpaces.push(topEdgeSpace)

    // also take into consideration a potential space from the left and right edge
    if (horizontal && (hasLeftEdgeGap || hasRightEdgeGap)) {
      topEdgeSpace.location.x = space.location.x
      topEdgeSpace.size.width = space.size.width
    }
  }

  if (hasBottomEdgeGap) {
    // if item has a gap from the bottom edge
    // add available space between the bottom of item and the bottom edge
    const bottomEdgeSpace = {
      location: { x, y: y + orientatedHeight },
      size: { width: orientatedWidth, height: space.location.y + space.size.height - y - orientatedHeight }
    }
    remainingSpaces.push(bottomEdgeSpace)

    // also take into consideration a potential space from the left and right edge
    if (horizontal && (hasLeftEdgeGap || hasRightEdgeGap)) {
      bottomEdgeSpace.location.x = space.location.x
      bottomEdgeSpace.size.width = space.size.width
    }
  }

  return remainingSpaces
}
