import { CutieInput, think } from "./brain";

test("Inputs work correctly", () => {
  const brain = {
    angle: [
      [
        [-1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      [1, 0, 0, 0, 0],
    ],
    speed: [
      [
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      [1, 0, 0, 0, 0],
    ],
  };

  const input: CutieInput = {
    angle: -Math.PI / 4,
    angleToFood: 0,
    distanceToFood: 100,
    hunger: 100,
  };

  const output = think(input, brain as any);

  expect(output.angle).toBeGreaterThan(0);
  expect(output.speed).toBeGreaterThan(0);
});
