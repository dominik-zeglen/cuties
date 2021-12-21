import { baseSystem } from "../ai";
import { Point, rotate, sub, toCartesian, toPolar } from "../r2";
import { Cutie, getInput } from "./cutie";

interface TestCase {
  cutie: Cutie;
  food: Point;
  expectedAngle: number;
}
const testCases: TestCase[] = [
  {
    cutie: new Cutie({
      ai: baseSystem,
      ancestors: 0,
      angle: Math.PI / 2,
      position: { x: 2, y: 0 },
    }),
    food: { x: -2, y: 0 },
    expectedAngle: -0.5,
  },
  {
    cutie: new Cutie({
      ai: baseSystem,
      ancestors: 0,
      angle: -Math.PI / 2,
      position: { x: 2, y: 0 },
    }),
    food: { x: -2, y: 0 },
    expectedAngle: 0.5,
  },
  {
    cutie: new Cutie({
      ai: baseSystem,
      ancestors: 0,
      angle: Math.PI,
      position: { x: 2, y: 0 },
    }),
    food: { x: -2, y: 0 },
    expectedAngle: 0,
  },
  {
    cutie: new Cutie({
      ai: baseSystem,
      ancestors: 0,
      angle: 0,
      position: { x: 2, y: 0 },
    }),
    food: { x: -2, y: 0 },
    expectedAngle: -1,
  },
  {
    cutie: new Cutie({
      ai: baseSystem,
      ancestors: 0,
      angle: 0,
      position: { x: -2, y: 0 },
    }),
    food: { x: 0, y: 2 },
    expectedAngle: -0.25,
  },
  {
    cutie: new Cutie({
      ai: baseSystem,
      ancestors: 0,
      angle: -Math.PI / 2,
      position: { x: -2, y: 0 },
    }),
    food: { x: 0, y: 2 },
    expectedAngle: -0.75,
  },
];

describe("getInput", () => {
  const t = test.each(testCases);
  t("Properly calculates input angle", (testCase) => {
    const nearestFood = toPolar(sub(testCase.food, testCase.cutie.position));
    const input = getInput(testCase.cutie, {
      iteration: 0,
      nearestFood,
    });

    expect(input.angleToFood).toBeGreaterThan(testCase.expectedAngle - 1e-3);
    expect(input.angleToFood).toBeLessThan(testCase.expectedAngle + 1e-3);
  });
});
