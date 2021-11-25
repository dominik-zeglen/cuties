import { dot, add, MathArray, multiply, clone } from "mathjs";

type Matrix = number[][];

export type CutieInput = Record<
  "hunger" | "angleToFood" | "angle" | "distanceToFood",
  number
>;
const inputs = 5;
export type CutieOutput = Record<"speed" | "angle", number>;
export type CutieBrain = Record<keyof CutieOutput, Matrix[]>;

const outputKeys: Array<keyof CutieOutput> = ["angle", "speed"];
function getRandomCutieOutputKey(): keyof CutieOutput {
  return outputKeys[Math.floor(Math.random() * outputKeys.length)];
}

const baseSystem = [
  Array(inputs).fill(Array(inputs).fill(0)),
  Array(inputs).fill(1),
];

function getRandomValue(): number {
  return Math.random() * 2 - 1;
}

function getRandomSystem(divide = 100): Matrix[] {
  const system = [
    Array(inputs)
      .fill(0)
      .map(() => Array(inputs).fill(0)),
    Array(inputs).fill(0),
  ];

  for (let index = 0; index < Math.random() * 3 + 1; index++) {
    system[0][Math.floor(Math.random() * inputs)][
      Math.floor(Math.random() * inputs)
    ] = getRandomValue() / divide;
  }

  for (let index = 0; index < Math.random() * 1 + 1; index++) {
    system[1][Math.floor(Math.random() * inputs)] = getRandomValue() / divide;
  }

  return system;
}

function addSystems(a: Matrix[], b: Matrix[]): Matrix[] {
  return [add(a[0], b[0]) as Matrix, add(a[1], b[1]) as Matrix];
}

export function getRandomCutieBrain(): CutieBrain {
  return {
    angle: addSystems(baseSystem, getRandomSystem(inputs ** 3)),
    speed: addSystems(baseSystem, getRandomSystem(inputs ** 3)),
  };
}

export function think(input: CutieInput, brain: CutieBrain): CutieOutput {
  const inputMatrix = [
    [input.angle],
    [input.angleToFood],
    [input.distanceToFood],
    [input.hunger],
    [1],
  ];

  return {
    angle: dot(
      brain.angle[1],
      multiply(brain.angle[0], inputMatrix) as MathArray
    ),
    speed: dot(
      brain.speed[1],
      multiply(brain.speed[0], inputMatrix) as MathArray
    ),
  };
}

export function mutate(brain: CutieBrain): CutieBrain {
  const mutatedBrain = clone(brain);
  const key = getRandomCutieOutputKey();

  mutatedBrain[key] = addSystems(brain[key], getRandomSystem());

  return brain;
}
