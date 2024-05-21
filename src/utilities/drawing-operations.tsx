import { type AreEqualFunction } from "./misc-operations"

export type Size = { width: number, height: number };
export type RGB = { r: number, g: number, b: number };
export type HSL = { h: number, s: number, l: number };
export type BorderRadii = { tl: number, tr: number, bl: number, br: number };

export const hexToRGB: (hexColor: string) => RGB | undefined  = (hexColor) => {
  if (!/\#[0-9A-F]{6}/gi.test(hexColor)) { return undefined }

  const r = parseInt(hexColor.substring(1, 3), 16)
  const  g = parseInt(hexColor.substring(3, 5), 16)
  const b = parseInt(hexColor.substring(5, 7), 16)
  return { r, g, b }
}

export const rgbToHSL: (rgbColor: RGB) => HSL = (rgbColor) => {
  let { r, g, b } = rgbColor
  r /= 255, g /= 255, b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if(max !== min) {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }

    h /= 6
  }

  return { h: Math.round((h * 360)), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export const hexToHSL: (hexColor: string) => HSL | undefined = (hexColor) => {
  const rgb = hexToRGB(hexColor)
  return rgb !== undefined ? rgbToHSL(rgb) : undefined
}

export const areHSLsEqual:AreEqualFunction<HSL> = (color1, color2) => {
  return (color1?.h === color2?.h
    && color1?.s === color2?.s
    && color1?.l === color2?.l)
}

export const areSizesEqual:AreEqualFunction<Size> = (size1, size2) => {
  return (size1?.width === size2?.width
    && size1?.height === size2?.height)
}

export const getTextSize = (context: CanvasRenderingContext2D, text: string): Size => {
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = context.measureText(text)
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent

  return { width, height }
}

export type RenderFunction = <T>(context: CanvasRenderingContext2D, data: T) => void;

type RenderPipelinFunction = (pipeline: Array<RenderFunction>) => { run: RenderFunction };
export const renderPipeline:RenderPipelinFunction = (pipeline) => {
  return {
    run: (context, data) => {
      for (let i = 0; i < pipeline.length; i++) {
        pipeline[i](context, data)
      }
    }
  }
}

type RunRenderPipelineFunction = <T>(context: CanvasRenderingContext2D, data: T, render: RenderFunction, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const runRenderPipeline: RunRenderPipelineFunction = (context, data, render, pre, post) => {
  const pipeline: Array<RenderFunction> = []
  if (pre) { pipeline.push(...pre) }
  pipeline.push(render)
  if (post) { pipeline.push(...post) }

  renderPipeline(pipeline).run(context, data)
}
