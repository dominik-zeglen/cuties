import { CutieInput, getRandomCutieAi, think } from "./ai";

test("Inputs work correctly", () => {
  const ai = getRandomCutieAi();

  const input: CutieInput = {
    angle: -Math.PI / 4,
    angleToFood: 0,
    distanceToFood: 100,
    hunger: 100,
  };

  const output = think(input, ai);

  expect(output.angle).toEqual(expect.any(Number));
  expect(output.speed).toEqual(expect.any(Number));
  expect(output.layEgg).toEqual(expect.any(Number));
  expect(output.speed).toEqual(expect.any(Number));
});
