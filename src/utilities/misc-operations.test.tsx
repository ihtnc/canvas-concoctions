import { afterEach, describe, expect, test, vi } from "vitest";
import { chooseRandom, deepCopy, operationPipeline } from "./misc-operations";

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

  describe('operationPipeline function', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    test('should not immediately call functions', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const fn3 = vi.fn();

      operationPipeline([
        fn1,
        fn2,
        fn3
      ]);

      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
      expect(fn3).not.toHaveBeenCalled();
    });

    test('should call functions sequentially when run is called', () => {
      const initialValue: number = 1;
      const fn1Return: number = 2;
      const fn2Return: number = 3;
      const fn3Return: number = 4;

      const fn1 = vi.fn().mockReturnValue(fn1Return);
      const fn2 = vi.fn().mockReturnValue(fn2Return);
      const fn3 = vi.fn().mockReturnValue(fn3Return);

      operationPipeline([
        fn1,
        fn2,
        fn3
      ]).run(initialValue);

      expect(fn1).toHaveBeenCalledWith(initialValue);
      expect(fn2).toHaveBeenCalledWith(fn1Return);
      expect(fn3).toHaveBeenCalledWith(fn2Return);
    });

    test('should return response from last function', () => {
      const fn3Return: number = 1;

      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const fn3 = vi.fn().mockReturnValue(fn3Return);

      const finalValue = operationPipeline([
        fn1,
        fn2,
        fn3
      ]).run([]);

      expect(finalValue).toBe(fn3Return);
    });
  });
});