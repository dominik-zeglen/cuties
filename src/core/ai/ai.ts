import { add, multiply, map, zeros, subtract, tanh, transpose } from "mathjs";
import {
  CutieAi,
  CutieInput,
  CutieOutput,
  Matrix2d,
  NeuralNetworkLayer,
  NeuralNetwork,
} from "./types";
import { getTargetInputMatrix } from "./utils";

export function createEmptyNetwork(...size: number[]): NeuralNetwork {
  return size.slice(0, -1).map((inputLayer, layerIndex) => ({
    biases: zeros([1, size[layerIndex + 1]]) as Matrix2d,
    weights: zeros([inputLayer, size[layerIndex + 1]]) as Matrix2d,
  }));
}

export const baseSystem: CutieAi = {
  action: createEmptyNetwork(3, 3, 5),
  target: createEmptyNetwork(10, 6, 2),
};

// AI following current target
baseSystem.action[1].biases[0][1] = 0.01;
baseSystem.action[1].biases[0][2] = 0.2;
baseSystem.action[1].biases[0][4] = 0.2;
baseSystem.action[1].weights[0][0] = -0.6;
baseSystem.action[0].weights[1][0] = 0.2;

baseSystem.target[1].weights[0][0] = 1;
baseSystem.target[0].weights[2][0] = 1;

function feedLayer(inputLayer: Matrix2d, layer: NeuralNetworkLayer): Matrix2d {
  return map(
    add(multiply(inputLayer, layer.weights), layer.biases) as Matrix2d,
    Math.tanh
  );
}

export function feed(input: Matrix2d, nn: NeuralNetwork): Matrix2d {
  return nn.reduce(feedLayer, input);
}

function actDerivative(x: number): number {
  return 1 - tanh(x) ** 2;
}

export function sgd(
  nn: NeuralNetwork,
  input: number[],
  output: number[],
  learningRate = 1e-2
): NeuralNetwork {
  const layerValues = nn.reduce(
    (layers, layer, layerIndex) => [
      ...layers,
      transpose(feed(transpose(layers[layerIndex]), [layer])),
    ],
    [transpose([input])] as Matrix2d[]
  );
  const errors: Matrix2d[] = [];
  errors[nn.length - 1] = subtract(
    transpose([output]),
    layerValues[layerValues.length - 1]
  ) as Matrix2d;

  const gradients: Matrix2d[] = [];
  gradients[nn.length - 1] = multiply(
    map(
      map(layerValues[layerValues.length - 1], actDerivative),
      (el, [rowIndex, colIndex]) =>
        el * errors[nn.length - 1][rowIndex][colIndex]
    ),
    learningRate
  );
  const newAi: NeuralNetwork = [];

  for (let i = nn.length - 1; i > 0; i--) {
    const deltas = multiply(gradients[i], transpose(layerValues[i]));

    newAi[i] = {
      biases: add(nn[i].biases, transpose(gradients[i])) as Matrix2d,
      weights: add(nn[i].weights, transpose(deltas)) as Matrix2d,
    };

    errors[i - 1] = multiply(nn[i].weights, errors[i]);
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
    biases: add(nn[0].biases, transpose(gradients[0])) as Matrix2d,
    weights: add(nn[0].weights, transpose(deltas)) as Matrix2d,
  };

  return newAi;
}

export function think(input: CutieInput, ai: CutieAi): CutieOutput {
  const target = feed(getTargetInputMatrix(input), ai.target);
  const actions = feed([[input.hunger, ...target[0]]], ai.action)[0];

  return {
    angle: actions[0],
    speed: actions[1],
    layEgg: actions[2],
    attack: actions[3],
    eat: actions[4],
  };
}
