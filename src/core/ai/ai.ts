import { add, multiply, map, zeros, subtract, tanh, transpose } from "mathjs";
import {
  CutieAi,
  CutieInput,
  CutieOutput,
  Matrix2d,
  CutieAiLayer,
} from "./types";
import { getInputMatrix } from "./utils";

export function createEmptyNetwork(...size: number[]): CutieAi {
  return size.slice(0, -1).map((inputLayer, layerIndex) => ({
    biases: zeros([1, size[layerIndex + 1]]) as Matrix2d,
    weights: zeros([inputLayer, size[layerIndex + 1]]) as Matrix2d,
  }));
}

export const baseSystem: CutieAi = createEmptyNetwork(10, 8, 5);
baseSystem[1].biases[0][1] = 0.08;
baseSystem[1].biases[0][2] = 0.2;
baseSystem[1].biases[0][4] = 0.2;
baseSystem[1].weights[0][0] = -0.6;
baseSystem[0].weights[2][0] = 0.2;

function feedLayer(inputLayer: Matrix2d, layer: CutieAiLayer): Matrix2d {
  return map(
    add(multiply(inputLayer, layer.weights), layer.biases) as Matrix2d,
    Math.tanh
  );
}

export function feed(input: Matrix2d, ai: CutieAi): Matrix2d {
  return ai.reduce(feedLayer, input);
}

function actDerivative(x: number): number {
  return 1 - tanh(x) ** 2;
}

export function sgd(
  ai: CutieAi,
  input: number[],
  output: number[],
  learningRate = 1e-2
): CutieAi {
  const layerValues = ai.reduce(
    (layers, layer, layerIndex) => [
      ...layers,
      transpose(feed(transpose(layers[layerIndex]), [layer])),
    ],
    [transpose([input])] as Matrix2d[]
  );
  const errors: Matrix2d[] = [];
  errors[ai.length - 1] = subtract(
    transpose([output]),
    layerValues[layerValues.length - 1]
  ) as Matrix2d;

  const gradients: Matrix2d[] = [];
  gradients[ai.length - 1] = multiply(
    map(
      map(layerValues[layerValues.length - 1], actDerivative),
      (el, [rowIndex, colIndex]) =>
        el * errors[ai.length - 1][rowIndex][colIndex]
    ),
    learningRate
  );
  const newAi: CutieAi = [];

  for (let i = ai.length - 1; i > 0; i--) {
    const deltas = multiply(gradients[i], transpose(layerValues[i]));

    newAi[i] = {
      biases: add(ai[i].biases, transpose(gradients[i])) as Matrix2d,
      weights: add(ai[i].weights, transpose(deltas)) as Matrix2d,
    };

    errors[i - 1] = multiply(ai[i].weights, errors[i]);
    gradients[i - 1] = multiply(
      map(
        map(layerValues[i], actDerivative),
        (el, [rowIndex, colIndex]) => el * errors[i - 1][rowIndex][colIndex]
      ),
      learningRate
    );
  }

  const iT = transpose(layerValues[0]);
  const deltas = multiply(gradients[0], iT);

  newAi[0] = {
    biases: add(ai[0].biases, transpose(gradients[0])) as Matrix2d,
    weights: add(ai[0].weights, transpose(deltas)) as Matrix2d,
  };

  return newAi;
}

export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const inputMatrix = getInputMatrix(input);

  const output = feed(inputMatrix, ai)[0];

  return {
    angle: output[0],
    speed: output[1],
    layEgg: output[2],
    attack: output[3],
    eat: output[4],
  };
}
