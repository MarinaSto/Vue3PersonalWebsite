import { describe, it } from "vitest";
import { rng, randomColorHsla } from "./helper.js";


describe('rng', () => {
  it('should return an integer number between min and max', () => {
    let res = rng(2,3);
    expect(res).toBeTypeOf('number').toBeGreaterThanOrEqual(2);
    })
})

describe('randomColorHsla', () => {
  it('should return a hsla color', () => {
    let res = randomColorHsla('20',"60");
    expect(res).toBeTypeOf('string').toMatch('hsla').toMatch('20');
    })
})
nq