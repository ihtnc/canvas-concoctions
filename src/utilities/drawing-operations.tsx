import { type ConditionalFunction, type AreEqualFunction } from "./misc-operations"

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
    const d = max - min
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
export type RenderPipelineRunFunction = <T>(context: CanvasRenderingContext2D, data: T, filters?: Array<RenderFilterFunction | ConditionalFilterObject>) => void;
export type ConditionalRenderObject = {
  condition: ConditionalFunction | Array<ConditionalFunction>,
  render: RenderFunction | Array<RenderFunction>
};
export type RenderFilterFunction = (context: CanvasRenderingContext2D) => void;
export type ConditionalFilterObject = {
  condition: ConditionalFunction | Array<ConditionalFunction>,
  filter: RenderFilterFunction | Array<RenderFilterFunction>
};

type RenderPipelinFunction = (pipeline: Array<RenderFunction | ConditionalRenderObject>) => { run: RenderPipelineRunFunction };
export const renderPipeline:RenderPipelinFunction = (pipeline) => {
  return {
    run: (context, data, filters) => {
      const filterFns = filters ?? []
      if (filterFns.length > 0) { context.save() }

      for (let i = 0; i < filterFns.length; i++) {
        const filter = filterFns[i]
        runFilter(context, data, filter)
      }

      for (let i = 0; i < pipeline.length; i++) {
        const item = pipeline[i]
        runRender(context, data, item)
      }

      if (filterFns.length > 0) { context.restore() }
    }
  }
}

type RunFilterFunction = <T>(context: CanvasRenderingContext2D, data: T, fn: RenderFilterFunction | ConditionalFilterObject) => void;
const runFilter: RunFilterFunction = (context, data, fn) => {
  if (typeof fn === 'function') {
    const filter = fn as RenderFilterFunction
    filter(context)
    return
  }

  if (typeof fn === 'object' && 'filter' in fn && 'condition' in fn) {
    const conditionalFilter = fn as ConditionalFilterObject

    if (typeof conditionalFilter.condition === 'function') {
      let conditionalFn = conditionalFilter.condition as ConditionalFunction
      if (conditionalFn(data) === false) { return }
    }

    if (Array.isArray(conditionalFilter.condition)) {
      let conditionalFns = conditionalFilter.condition as Array<ConditionalFunction>
      if (conditionalFns.some((fn) => fn(data) === false)) { return }
    }

    if (typeof conditionalFilter.filter === 'function') {
      const filterFn = conditionalFilter.filter as RenderFilterFunction
      filterFn(context)
    }

    if (Array.isArray(conditionalFilter.filter)) {
      let filterFns = conditionalFilter.filter as Array<RenderFilterFunction>
      for (let i = 0; i < filterFns.length; i++) {
        filterFns[i](context)
      }
    }
  }
}

type RunRenderFunction = <T>(context: CanvasRenderingContext2D, data: T, fn: RenderFunction | ConditionalRenderObject) => void;
const runRender: RunRenderFunction = (context, data, fn) => {
  if (typeof fn === 'function') {
    const render = fn as RenderFunction
    render(context, data)
    return
  }

  if (typeof fn === 'object' && 'render' in fn && 'condition' in fn) {
    const conditionalRender = fn as ConditionalRenderObject

    if (typeof conditionalRender.condition === 'function') {
      const conditionalFn = conditionalRender.condition as ConditionalFunction
      if (conditionalFn(data) === false) { return }
    }

    if (Array.isArray(conditionalRender.condition)) {
      let conditionalFns = conditionalRender.condition as Array<ConditionalFunction>
      if (conditionalFns.some((fn) => fn(data) === false)) { return }
    }

    if (typeof conditionalRender.render === 'function') {
      const renderFn = conditionalRender.render as RenderFunction
      renderFn(context, data)
    }

    if (Array.isArray(conditionalRender.render)) {
      let renderFns = conditionalRender.render as Array<RenderFunction>
      for (let i = 0; i < renderFns.length; i++) {
        renderFns[i](context, data)
      }
    }
  }
}

type ConditionalRenderFunction = <T>(condition: ((data: T) => boolean) | (Array<(data: T) => boolean>), render: (context: CanvasRenderingContext2D, data: T) => void) => ConditionalRenderObject;
export const renderWhen:ConditionalRenderFunction = (condition, render) => {
  return {
    condition: condition as ConditionalFunction,
    render: render as RenderFunction
  }
}

type ConditionalFilterFunction = <T>(condition: ((data: T) => boolean) | (Array<(data: T) => boolean>), filter: (context: CanvasRenderingContext2D) => void) => ConditionalFilterObject;
export const filterWhen:ConditionalFilterFunction = (condition, filter) => {
  return {
    condition: condition as ConditionalFunction,
    filter: filter as RenderFilterFunction
  }
}

type RunRenderPipelineFunction = <T>(context: CanvasRenderingContext2D, data: T, render: RenderFunction, pre?: Array<RenderFunction | ConditionalRenderObject>, post?: Array<RenderFunction | ConditionalRenderObject>) => void;
export const runRenderPipeline: RunRenderPipelineFunction = (context, data, render, pre, post) => {
  const pipeline: Array<RenderFunction | ConditionalRenderObject> = []
  if (pre) { pipeline.push(...pre) }
  pipeline.push(render)
  if (post) { pipeline.push(...post) }

  renderPipeline(pipeline).run(context, data)
}
