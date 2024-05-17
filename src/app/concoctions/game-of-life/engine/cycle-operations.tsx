import ENGINE_DATA from './data'

const normaliseCycleIndex = (cycleIndex: number) => {
  return (cycleIndex % ENGINE_DATA.CycleLength) + 1
}

export const isDormantPhase = (cycleIndex: number): boolean => {
  const checkIndex = ENGINE_DATA.CycleLength - ENGINE_DATA.StateTransitionLength
  const index = normaliseCycleIndex(cycleIndex)
  return index < checkIndex
}
export const isCheckStatePhase  = (cycleIndex: number): boolean => {
  const dormantLength = ENGINE_DATA.CycleLength - ENGINE_DATA.StateTransitionLength
  return normaliseCycleIndex(cycleIndex) === dormantLength
}
export const isTransitionPhase = (cycleIndex: number): boolean => {
  const checkIndex = ENGINE_DATA.CycleLength - ENGINE_DATA.StateTransitionLength
  const index = normaliseCycleIndex(cycleIndex)
  return index > checkIndex && index < ENGINE_DATA.CycleLength
}
export const isEndPhase = (cycleIndex: number): boolean => {
  return normaliseCycleIndex(cycleIndex) === ENGINE_DATA.CycleLength
}

export const getCycleProgress = (cycleIndex: number): number => {
  return normaliseCycleIndex(cycleIndex) / ENGINE_DATA.CycleLength
}