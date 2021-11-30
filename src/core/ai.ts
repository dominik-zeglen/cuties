import { add, multiply, map } from "mathjs";

type Matrix = number[][];

export type CutieInput = Record<
  "hunger" | "angleToFood" | "angle" | "distanceToFood",
  number
>;
const inputs = 5;
export type CutieOutput = Record<"speed" | "angle" | "eat" | "layEgg", number>;
export type CutieAi = Matrix[];

const baseSystem = [Array(inputs).fill(Array(inputs).fill(0))];

function getRandomSystem(divide: number): Matrix[] {
  const system = [
    Array(inputs)
      .fill(0)
      .map(() => Array(inputs).fill(0)),
  ];

  for (let layer = 0; layer < system.length; layer++) {
    for (let index = 0; index < Math.random() * inputs ** 2 + 1; index++) {
      system[layer][Math.floor(Math.random() * inputs)][
        Math.floor(Math.random() * inputs)
      ] = (Math.random() - 0.5) / divide;
    }
  }

  return system;
}

function addSystems(a: Matrix[], b: Matrix[]): Matrix[] {
  return a.map((_, layerIndex) => add(a[layerIndex], b[layerIndex]) as Matrix);
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1));
}

// 1 x 5 . 5 x 5  => 1 x 5
export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const inputMatrix = [
    [input.angle, input.angleToFood, input.distanceToFood, input.hunger, 1],
  ];

  const output = ai.reduce(
    (prevLayer, layer) => map(multiply(prevLayer, layer), Math.tanh),
    inputMatrix
  );

  return {
    angle: output[0][0],
    speed: output[0][1],
    eat: output[0][2],
    layEgg: output[0][3],
  };
}

export function mutate(ai: CutieAi): CutieAi {
  return addSystems(ai, getRandomSystem(10));
}
