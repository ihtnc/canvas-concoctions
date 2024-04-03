export type RGB = { r: number, g: number, b: number };
export type HSL = { h: number, s: number, l: number };

export const hexToRGB: (hexColor: string) => RGB | undefined  = (hexColor) => {
  if (!/\#[0-9A-F]{6}/gi.test(hexColor)) { return undefined; }

  const r = parseInt(hexColor.substring(1, 3), 16);
  const  g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  return { r, g, b };
};

export const rgbToHSL: (rgbColor: RGB) => HSL = (rgbColor) => {
  let { r, g, b } = rgbColor;
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if(max !== min) {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    };

    h /= 6;
  }

  return { h: Math.round((h * 360)), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hexToHSL: (hexColor: string) => HSL | undefined = (hexColor) => {
  const rgb = hexToRGB(hexColor);
  return rgb !== undefined ? rgbToHSL(rgb) : undefined;
};

export const compareHSL: (color1: HSL, color2: HSL) => boolean = (color1, color2) => {
  return (color1.h === color2.h
    && color1.s === color2.s
    && color1.l === color2.l);
};
