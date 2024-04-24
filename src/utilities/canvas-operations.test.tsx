import { describe, expect, test, vi, afterEach } from "vitest";
import { clearFrame } from "./canvas-operations";

describe('canvas operations', () => {
  describe('clearFrame function', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    test('should call getContext', () => {
      const mock = {
        getContext: vi.fn()
      };

      const canvas = mock as unknown as HTMLCanvasElement;
      clearFrame(canvas);

      expect(mock.getContext).toBeCalledWith('2d');
    });

    test('should call clearRect', () => {
      const width = 123;
      const height = 456;
      const mock = {
        width,
        height,
        getContext: vi.fn()
      };
      const context = { clearRect: vi.fn() };
      mock.getContext.mockReturnValue(context);

      const canvas = mock as unknown as HTMLCanvasElement;
      clearFrame(canvas);

      expect(context.clearRect).toBeCalledWith(0, 0, width, height);
    });
  });
});