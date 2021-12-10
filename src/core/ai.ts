import { add, multiply, map, clone } from "mathjs";

type Matrix = number[][];

export type CutieInput = Record<
  "hunger" | "angleToFood" | "angle" | "distanceToFood",
  number
>;
const inputs = 5;
export type CutieOutput = Record<"speed" | "angle" | "eat" | "layEgg", number>;
export type CutieAi = Matrix[];

const baseSystem: CutieAi = [
  Array(inputs)
    .fill(0)
    .map(() => Array(8).fill(0)),
  Array(8)
    .fill(0)
    .map(() => Array(inputs).fill(0)),
];

function getRandomSystem(divide: number): Matrix[] {
  const system = clone(baseSystem);

  for (let layer = 0; layer < system.length; layer++) {
    const mutations = Math.random() * inputs + 1;

    for (let index = 0; index < mutations; index++) {
      system[layer][Math.floor(Math.random() * inputs)][
        Math.floor(Math.random() * inputs)
      ] = Math.random() > 0.5 ? 1 : -1 / divide;
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

// 1 x 5 . 5 x 5 . 5 x 5 => 1 x 5
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

export function mutate(ai: CutieAi, factor: number): CutieAi {
  return addSystems(ai, getRandomSystem(factor));
}
