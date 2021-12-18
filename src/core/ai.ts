import { add, multiply, map, zeros } from "mathjs";
import cloneDeep from "lodash/cloneDeep";

export type CutieInput = Record<
  "hunger" | "angleToFood" | "angle" | "distanceToFood",
  number
>;
const inputs = 4;
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
    biases: zeros([1, hidden]) as Matrix2d,
    weights: zeros([inputs, hidden]) as Matrix2d,
  },
  {
    biases: zeros([1, outputs]) as Matrix2d,
    weights: zeros([hidden, outputs]) as Matrix2d,
  },
];

function getRandomSystem(divide: number): CutieAi {
  const system = cloneDeep(baseSystem);

  for (let layer = 0; layer < system.length; layer++) {
    const mutations = 1;

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
  return addSystems(baseSystem, getRandomSystem(1));
}

export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const inputMatrix = [
    [input.angle, input.angleToFood, input.distanceToFood, input.hunger],
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

export function mutate(ai: CutieAi, factor: number): CutieAi {
  return addSystems(ai, getRandomSystem(factor));
}
