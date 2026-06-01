import { describe, it, expect } from "vitest";
import { parseColor, contrastRatio, luminance, parseInlineColors } from "../src/utils/color.js";

describe("parseColor", () => {
  it("parses 6- and 3-digit hex", () => {
    expect(parseColor("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor("#000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses rgb() and named colors", () => {
    expect(parseColor("rgb(18, 52, 86)")).toEqual({ r: 18, g: 52, b: 86 });
    expect(parseColor("white")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("returns null for unsupported input", () => {
    expect(parseColor("hsl(0,0,0)")).toBeNull();
    expect(parseColor("not-a-color")).toBeNull();
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0);
  });

  it("is 1 for identical colors", () => {
    expect(contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 })).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    const a = { r: 0, g: 0, b: 0 };
    const b = { r: 200, g: 200, b: 200 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5);
  });
});

describe("luminance & parseInlineColors", () => {
  it("orders luminance white > gray > black", () => {
    expect(luminance({ r: 255, g: 255, b: 255 })).toBeGreaterThan(luminance({ r: 128, g: 128, b: 128 }));
    expect(luminance({ r: 128, g: 128, b: 128 })).toBeGreaterThan(luminance({ r: 0, g: 0, b: 0 }));
  });

  it("extracts color and background from inline style", () => {
    expect(parseInlineColors("color: #fff; background-color: #000")).toEqual({
      color: "#fff",
      background: "#000",
    });
  });
});
