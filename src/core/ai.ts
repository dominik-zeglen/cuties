import { add, multiply, map, zeros, derivative, matrix, Matrix } from "mathjs";
import cloneDeep from "lodash/cloneDeep";

export type CutieInput = Record<
  "hunger" | "foundFood" | "angleToFood" | "distanceToFood",
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

export const baseSystem: CutieAi = [
  {
    biases: zeros([1, outputs]) as Matrix2d,
    weights: zeros([inputs, outputs]) as Matrix2d,
  },
  // {
  //   biases: zeros([1, outputs]) as Matrix2d,
  //   weights: zeros([hidden, outputs]) as Matrix2d,
  // },
];
// baseSystem[0].weights[2][0] = -0.1;
// baseSystem[0].biases[0][1] = 0.2;

function getMultiplicationProductFormula(n: number, index: number): string {
  return Array(n)
    .fill(0)
    .map((__, wIndex) => `x_${wIndex} * a_${wIndex}_${index}`)
    .join(" + ");
}

function getNthOutputFormula(index: number): string {
  return `(tanh(${getMultiplicationProductFormula(
    inputs,
    index
  )} + b_${index}) - y_${index})^2`;
}

const derivatives = [
  {
    biases: [
      Array(outputs)
        .fill(0)
        .map((_, index) =>
          derivative(getNthOutputFormula(index), `b_${index}`).compile()
        ),
    ],
    weights: Array(inputs)
      .fill(0)
      .map((_, rowIndex) =>
        Array(outputs)
          .fill(0)
          .map((__, colIndex) =>
            derivative(
              getNthOutputFormula(colIndex),
              `a_${rowIndex}_${colIndex}`
            ).compile()
          )
      ),
  },
];

export function sgd(
  ai: CutieAi,
  input: number[],
  output: number[],
  learningRate = 1e-2
): CutieAi {
  const l1Variables = {};

  for (let outputIndex = 0; outputIndex < outputs; outputIndex++) {
    l1Variables[`b_${outputIndex}`] = ai[0].biases[0][outputIndex];
    l1Variables[`y_${outputIndex}`] = output[outputIndex];
    for (let inputIndex = 0; inputIndex < inputs; inputIndex++) {
      l1Variables[`a_${outputIndex}_${inputIndex}`] =
        ai[0].weights[outputIndex][inputIndex];
    }
  }
  for (let inputIndex = 0; inputIndex < inputs; inputIndex++) {
    l1Variables[`x_${inputIndex}`] = input[inputIndex];
  }

  return [
    {
      biases: (
        add(
          matrix(ai[0].biases),
          multiply(
            matrix([
              derivatives[0].biases[0].map((d) => d.evaluate(l1Variables)),
            ]),
            -learningRate
          )
        ) as Matrix
      ).toArray() as Matrix2d,
      weights: (
        add(
          matrix(ai[0].weights),
          multiply(
            matrix(
              derivatives[0].weights.map((row) =>
                row.map((d) => d.evaluate(l1Variables))
              )
            ),
            -learningRate
          )
        ) as Matrix
      ).toArray() as Matrix2d,
    },
  ];
}

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

export function getInputMatrix(input: CutieInput): Matrix2d {
  return [
    [input.hunger, input.foundFood, input.angleToFood, input.distanceToFood],
  ];
}

export function feed(input: Matrix2d, ai: CutieAi): Matrix2d {
  return ai.reduce(
    (prevLayer, layer) =>
      map(
        add(multiply(prevLayer, layer.weights), layer.biases) as Matrix2d,
        Math.tanh
      ),
    input
  );
}

// 1 x 5 . 5 x 8 . 8 x 4 => 1 x 4
export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const inputMatrix = getInputMatrix(input);

  const output = feed(inputMatrix, ai)[0];

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
