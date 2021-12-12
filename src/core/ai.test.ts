import cloneDeep from "lodash/cloneDeep";
import { subtract } from "mathjs";
import { rootMeanSquare } from "simple-statistics";
import {
  baseSystem,
  CutieAi,
  CutieInput,
  feed,
  getRandomCutieAi,
  sgd,
  think,
  mutate,
} from "./ai";

test("Inputs work correctly", () => {
  // Given
  const ai = getRandomCutieAi();
  const input: CutieInput = {
    hunger: 100,
    angleToFood: 0,
    distanceToFood: 100,
    angleToCutie: Math.PI / 4,
    distanceToCutie: 200,
    angleToRemains: Math.PI / 4,
    distanceToRemains: 200,
    foundCutie: 1,
    foundFood: 1,
    foundRemains: 1,
  };

  // When
  const output = think(input, ai);

  // Then
  expect(output.angle).toEqual(expect.any(Number));
  expect(output.speed).toEqual(expect.any(Number));
  expect(output.layEgg).toEqual(expect.any(Number));
  expect(output.speed).toEqual(expect.any(Number));
  expect(output.attack).toEqual(expect.any(Number));
});

test("Properly mutates", () => {
  // Given
  const ai = getRandomCutieAi();
  const input: CutieInput = {
    hunger: 100,
    angleToFood: 0,
    distanceToFood: 100,
    angleToCutie: Math.PI / 4,
    distanceToCutie: 200,
    angleToRemains: Math.PI / 4,
    distanceToRemains: 200,
    foundCutie: 1,
    foundFood: 1,
    foundRemains: 1,
  };

  // When
  const mutated = mutate(ai, 1);
  const output = think(input, mutated);

  // Then
  expect(mutated).not.toBeNull();
  expect(output.angle).toEqual(expect.any(Number));
  expect(output.speed).toEqual(expect.any(Number));
  expect(output.layEgg).toEqual(expect.any(Number));
  expect(output.speed).toEqual(expect.any(Number));
  expect(output.attack).toEqual(expect.any(Number));
});

describe("SGD", () => {
  it("works", () => {
    const ai: CutieAi = cloneDeep(baseSystem);
    const input = [[0, 1, 0, 1, 0, 0]];
    const output = feed(input, ai);
    const desiredOutput = [[1, 0, 0, 0, 0]];

    const newAi = sgd(ai, input[0], desiredOutput[0]);
    const newOutput = feed(input, newAi);

    expect(newOutput).not.toBe(output);
    expect((desiredOutput[0][0] - newOutput[0][0]) ** 2).toBeLessThan(
      (desiredOutput[0][0] - output[0][0]) ** 2
    );
  });

  it("descends in valid gradient", () => {
    const ai: CutieAi = cloneDeep(baseSystem);
    const input = [[0, 1, 0, 1, 0, 0]];
    const output = feed(input, ai);
    const desiredOutput = [[1, 0, 0, 1, 0]];

    const newAi = sgd(ai, input[0], desiredOutput[0], 1);
    const newOutput = feed(input, newAi);

    expect(output).toEqual([[0, 0, 0, 0, 0]]);
    expect(
      rootMeanSquare(subtract(newOutput[0], desiredOutput[0]) as number[])
    ).toBeLessThan(1e-5);
  });
});
