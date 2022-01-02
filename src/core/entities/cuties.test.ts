import { getRandomCutieAi } from "../ai";
import { Point, sub, toPolar } from "../r2";
import { Cutie, getAngleInput, getRandomCutie } from "./cutie";

interface TestCase {
  cutie: Cutie;
  food: Point;
  expectedAngle: number;
}
const testCases: TestCase[] = [
  {
    cutie: new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: Math.PI / 2,
      position: { x: 2, y: 0 },
      color: "",
      shape: 0,
    }),
    food: { x: -2, y: 0 },
    expectedAngle: -0.5,
  },
  {
    cutie: new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: -Math.PI / 2,
      position: { x: 2, y: 0 },
      color: "",
      shape: 0,
    }),
    food: { x: -2, y: 0 },
    expectedAngle: 0.5,
  },
  {
    cutie: new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: Math.PI,
      position: { x: 2, y: 0 },
      color: "",
      shape: 0,
    }),
    food: { x: -2, y: 0 },
    expectedAngle: 0,
  },
  {
    cutie: new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: 0,
      position: { x: 2, y: 0 },
      color: "",
      shape: 0,
    }),
    food: { x: -2, y: 0 },
    expectedAngle: -1,
  },
  {
    cutie: new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: 0,
      position: { x: -2, y: 0 },
      color: "",
      shape: 0,
    }),
    food: { x: 0, y: 2 },
    expectedAngle: -0.25,
  },
  {
    cutie: new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: -Math.PI / 2,
      position: { x: -2, y: 0 },
      color: "",
      shape: 0,
    }),
    food: { x: 0, y: 2 },
    expectedAngle: -0.75,
  },
];

describe("getInput", () => {
  const t = test.each(testCases);
  t("Properly calculates input angle", (testCase) => {
    const nearestFoodPos = toPolar(sub(testCase.food, testCase.cutie.position));
    const angle = getAngleInput(nearestFoodPos, testCase.cutie.angle);

    expect(Math.sqrt(angle ** 2 - testCase.expectedAngle ** 2)).toBeLessThan(
      1e-5
    );
  });
});

describe("Energy usage", () => {
  let cutie: Cutie;
  let baseEnergy: number;

  beforeEach(() => {
    cutie = getRandomCutie();
    baseEnergy = cutie.energyUsage();
  });

  it("is higher when rotating clockwise", () => {
    cutie.thoughts.angle = -1;

    expect(cutie.energyUsage()).toBeGreaterThan(baseEnergy);
  });

  it("is higher when moving forward", () => {
    cutie.thoughts.speed = 1;

    expect(cutie.energyUsage()).toBeGreaterThan(baseEnergy);
  });

  it("is higher when moving backward", () => {
    cutie.thoughts.speed = -1;

    expect(cutie.energyUsage()).toBeGreaterThan(baseEnergy);
  });

  it("is higher when attempting to eat", () => {
    cutie.thoughts.eat = 1;

    expect(cutie.energyUsage()).toBeGreaterThan(baseEnergy);
  });

  it("is higher when attempting to procreate", () => {
    cutie.thoughts.layEgg = 1;

    expect(cutie.energyUsage()).toBeGreaterThan(baseEnergy);
  });

  it("is higher when attempting to attack", () => {
    cutie.thoughts.attack = 1;

    expect(cutie.energyUsage()).toBeGreaterThan(baseEnergy);
  });
});
