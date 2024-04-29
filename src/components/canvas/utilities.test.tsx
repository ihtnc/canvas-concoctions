import { describe, expect, test } from "vitest";
import { areCoordinatesEqual } from './utilities';
import { Coordinates } from "./types";

describe('canvas utilities', () => {
  describe('areCoordinatesEqual function', () => {
    test('should return true when comparing Coordinates to itself', () => {
      const coordinates: Coordinates = {
        x: 12,
        y: 34
      };

      const result = areCoordinatesEqual(coordinates, coordinates);
      expect(result).toBe(true);
    });

    test('should handle undefined value1', () => {
      const coordinates: Coordinates = {
        x: 12,
        y: 34
      };

      const result = areCoordinatesEqual(undefined, coordinates);
      expect(result).toBe(false);
    });

    test('should handle undefined value2', () => {
      const coordinates: Coordinates = {
        x: 12,
        y: 34
      };

      const result = areCoordinatesEqual(coordinates, undefined);
      expect(result).toBe(false);
    });

    test('should return true if both are undefined', () => {
      const result = areCoordinatesEqual(undefined, undefined);
      expect(result).toBe(true);
    });

    test.each([
      { value: 2, expected: true },
      { value: 1, expected: false },
      { value: 3, expected: false }
    ])('should compare the x component ($value)', ({ value, expected }: { value: number, expected: boolean }) => {
      const mainCoordinates: Coordinates = {
        x: 2,
        y: 3
      };

      const otherCoordinates: Coordinates = {
        x: value,
        y: mainCoordinates.y
      };

      const result = areCoordinatesEqual(mainCoordinates, otherCoordinates);
      expect(result).toBe(expected);
    });

    test.each([
        { value: 2, expected: true },
        { value: 1, expected: false },
        { value: 3, expected: false }
    ])('should compare the y component ($value)', ({ value, expected }: { value: number, expected: boolean }) => {
      const mainCoordinates: Coordinates = {
        x: 3,
        y: 2
      };

      const otherCoordinates: Coordinates = {
        x: mainCoordinates.x,
        y: value
      };

      const result = areCoordinatesEqual(mainCoordinates, otherCoordinates);
      expect(result).toBe(expected);
    });
  });
});
