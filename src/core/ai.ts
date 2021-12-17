import { add, multiply, map, zeros } from "mathjs";
import cloneDeep from "lodash/cloneDeep";

export type CutieInput = Record<
  "hunger" | "angle" | "foundFood" | "angleToFood" | "distanceToFood",
  number
>;
const inputs = 5;
const outputs = 4;
const hidden = 8;
type Matrix2d = number[][];
export type CutieOutput = Record<"speed" | "angle" | "eat" | "layEgg", number>;
export interface CutieAiLayer {
  biases: Matrix2d;
  weights: Matrix2d;
}
export type CutieAi = CutieAiLayer[];

const baseSystem: CutieAi = [
  {
    biases: zeros([1, outputs]) as Matrix2d,
    weights: zeros([inputs, outputs]) as Matrix2d,
  },
];

function getRandomSystem(divide: number, mutations = 1): CutieAi {
  const system = cloneDeep(baseSystem);

  for (let layer = 0; layer < system.length; layer++) {
    for (let index = 0; index < mutations; index++) {
      const xw = Math.floor(Math.random() * system[layer].weights.length);
      const yw = Math.floor(Math.random() * system[layer].weights[xw].length);
      system[layer].weights[xw][yw] = (Math.random() > 0.5 ? 1 : -1) / divide;

      if (Math.random() > 0.8) {
        const xb = Math.floor(Math.random() * system[layer].biases.length);
        const yb = Math.floor(Math.random() * system[layer].biases[xb].length);
        system[layer].biases[xb][yb] = (Math.random() > 0.5 ? 1 : -1) / divide;
      }
    }
  }

  return system;
}

function addSystems(a: CutieAi, b: CutieAi): CutieAi {
  return a.map((_, layerIndex) => ({
    biases: add(a[layerIndex].biases, b[layerIndex].biases) as Matrix2d,
    weights: add(a[layerIndex].weights, b[layerIndex].weights) as Matrix2d,
  }));
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1e2, 20));
}

// 1 x 5 . 5 x 8 . 8 x 4 => 1 x 4
export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const inputMatrix = [
    [
      input.angle,
      input.hunger,
      input.foundFood,
      input.angleToFood,
      input.distanceToFood,
    ],
  ];

  const output = ai.reduce(
    (prevLayer, layer) =>
      map(
        add(multiply(prevLayer, layer.weights), layer.biases) as Matrix2d,
        Math.tanh
      ),
    inputMatrix
  )[0];

  return {
    angle: output[0],
    speed: output[1],
    eat: output[2],
    layEgg: output[3],
  };
}

export function mutate(ai: CutieAi, factor: number, mutations = 1): CutieAi {
  return addSystems(ai, getRandomSystem(factor, mutations));
}
