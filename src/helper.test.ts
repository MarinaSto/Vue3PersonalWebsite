import { describe, it, expect } from "vitest";
import { rng, randomColorHsla } from "./helper.js";

describe("rng", () => {
  it("should return an integer number between min and max", () => {
    const res = rng(2, 3);
    expect(res).toBeTypeOf("number");
    expect(res).toBeGreaterThanOrEqual(2);
  });
});

describe("randomColorHsla", () => {
  it("should return a hsla color", () => {
    const res = randomColorHsla(20, 60);
    expect(res).toBeTypeOf("string");
    expect(res).toMatch("hsla");
    expect(res).toMatch("20");
  });
});
