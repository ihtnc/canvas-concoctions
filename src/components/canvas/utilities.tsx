import { type AreEqualFunction } from "@/utilities/misc-operations"
import { type Coordinates } from "@ihtnc/use-animated-canvas"

export const areCoordinatesEqual: AreEqualFunction<Coordinates> = (coordinates1, coordinates2): boolean => {
  if (coordinates1?.x !== coordinates2?.x) { return false }
  if (coordinates1?.y !== coordinates2?.y) { return false }

  return true
}