import { subtract } from "mathjs";
import { rootMeanSquare, shuffle } from "simple-statistics";
import { createEmptyNetwork } from ".";
import { feed, sgd, think } from "./ai";
import { getRandomCutieAi, mutate } from "./mutate";
import { CutieAi, CutieInput } from "./types";

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
  it("descends in valid gradient", () => {
    const ai: CutieAi = createEmptyNetwork(2, 6, 1);
    const input = [[0, 1]];
    const output = feed(input, ai);
    const desiredOutput = [[1]];

    const newAi = sgd(ai, input[0], desiredOutput[0], 1);
    const newOutput = feed(input, newAi);

    expect(newOutput).not.toBe(output);
    expect((desiredOutput[0][0] - newOutput[0][0]) ** 2).toBeLessThan(
      (desiredOutput[0][0] - output[0][0]) ** 2
    );
  });

  it("properly solves XOR problem", () => {
    let net = createEmptyNetwork(2, 6, 1);
    const dataset = shuffle([
      {
        x: [-1, -1],
        y: -1,
      },
      {
        x: [1, 1],
        y: -1,
      },
      {
        x: [-1, 1],
        y: 1,
      },
      {
        x: [1, -1],
        y: 1,
      },
    ]);
    const train = dataset;
    const test = dataset;

    for (let i = 0; i < 1e4; i++) {
      const sample = train[Math.floor(Math.random() * train.length)];
      const label = [sample.y];
      net = sgd(net, sample.x, label, 1e-1);
    }

    const predictions = test.map((sample) => {
      const output = feed([sample.x], net)[0][0];

      return (output > 0.5 ? 1 : -1) === sample.y;
    });

    const acc = predictions.filter(Boolean).length / test.length;

    expect(acc).toBeGreaterThan(0.99);
  });
});
