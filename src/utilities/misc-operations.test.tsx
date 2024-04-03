import { describe, expect, test } from "vitest";
import { chooseRandom, deepCopy } from "./misc-operations";

describe('misc operations', () => {
  describe('chooseRandom function', () => {
    test('should only choose between min and max inclusive', () => {
      const min = 2;
      const max = 5;

      for (let i = 0; i < 100; i++) {
        const result = chooseRandom(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });
  });

  describe('deepCopy function', () => {
    test('should handle numbers', () => {
      const value = 123;
      const result = deepCopy(value);
      expect(result).toBe(value);
    });

    test('should handle strings', () => {
      const value = '123';
      const result = deepCopy(value);
      expect(result).toBe(value);
    });

    test('should handle date', () => {
      const value = new Date(2024, 1, 1);
      const result = deepCopy(value);
      expect(result).toStrictEqual(value);
    });

    test('should handle objects', () => {
      const value = { numericProp: 123, stringProp: 'abc' };
      const copy = value;

      const result = deepCopy(value);

      expect(copy).toBe(value);
      expect(result).not.toBe(value);
      expect(result).toStrictEqual(value);
    });

    test('should handle nested objects', () => {
      const prop = { numericProp: 123, stringProp: 'abc' };
      const value = { objProp: prop };
      const copy = value;

      const result = deepCopy(value);

      expect(copy).toBe(value);
      expect(result).not.toBe(value);
      expect(result.objProp).not.toBe(value.objProp);
      expect(result).toStrictEqual(value);
    });
  });
});