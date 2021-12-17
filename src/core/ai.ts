import { add, multiply, map } from "mathjs";
import cloneDeep from "lodash/cloneDeep";

type Matrix = number[][];

export type CutieInput = Record<
  "hunger" | "angleToFood" | "angle" | "distanceToFood",
  number
>;
const inputs = 4;
const outputs = 4;
const hidden = 8;
export type CutieOutput = Record<"speed" | "angle" | "eat" | "layEgg", number>;
export interface CutieAiLayer {
  biases: Matrix;
  weights: Matrix;
}
export type CutieAi = CutieAiLayer[];

const baseSystem: CutieAi = [
  {
    biases: Array(1)
      .fill(0)
      .map(() => Array(hidden).fill(0)),
    weights: Array(inputs)
      .fill(0)
      .map(() => Array(hidden).fill(0)),
  },
  {
    biases: Array(1)
      .fill(0)
      .map(() => Array(outputs).fill(0)),
    weights: Array(hidden)
      .fill(0)
      .map(() => Array(outputs).fill(0)),
  },
];

function getRandomSystem(divide: number): CutieAi {
  const system = cloneDeep(baseSystem);

  for (let layer = 0; layer < system.length; layer++) {
    const mutations = Math.random() * inputs + 1;

    for (let index = 0; index < mutations; index++) {
      const xb = Math.floor(Math.random() * system[layer].biases.length);
      const yb = Math.floor(Math.random() * system[layer].biases[xb].length);
      system[layer].biases[xb][yb] = (Math.random() > 0.5 ? 1 : -1) / divide;

      const xw = Math.floor(Math.random() * system[layer].biases.length);
      const yw = Math.floor(Math.random() * system[layer].biases[xw].length);
      system[layer].weights[xw][yw] = (Math.random() > 0.5 ? 1 : -1) / divide;
    }
  }

  return system;
}

function addSystems(a: CutieAi, b: CutieAi): CutieAi {
  return a.map((_, layerIndex) => ({
    biases: add(a[layerIndex].biases, b[layerIndex].biases) as Matrix,
    weights: add(a[layerIndex].weights, b[layerIndex].weights) as Matrix,
  }));
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1));
}

export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const inputMatrix = [
    [input.angle, input.angleToFood, input.distanceToFood, input.hunger],
  ];

  const output = ai.reduce(
    (prevLayer, layer) =>
      map(
        add(multiply(prevLayer, layer.weights), layer.biases) as Matrix,
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

export function mutate(ai: CutieAi, factor: number): CutieAi {
  return addSystems(ai, getRandomSystem(factor));
}
