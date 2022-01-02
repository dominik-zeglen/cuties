import { add, matrix, random } from "mathjs";
import { CutieAi, Matrix2d } from "./types";
import { baseSystem } from "./ai";
import { limit } from ".";

function getRandomSystem(factor: number): CutieAi {
  return {
    action: baseSystem.action.map((layer) => ({
      biases: matrix(layer.biases)
        .map(() =>
          random(
            (-1 / Math.sqrt(layer.biases.length)) * factor,
            (1 / Math.sqrt(layer.biases.length)) * factor
          )
        )
        .toArray() as Matrix2d,
      weights: matrix(layer.weights)
        .map(() =>
          random(
            (-1 / Math.sqrt(layer.weights.length)) * factor,
            (1 / Math.sqrt(layer.weights.length)) * factor
          )
        )
        .toArray() as Matrix2d,
    })),
    target: baseSystem.target.map((layer) => ({
      biases: matrix(layer.biases)
        .map(() =>
          random(
            (-1 / Math.sqrt(layer.biases.length)) * factor,
            (1 / Math.sqrt(layer.biases.length)) * factor
          )
        )
        .toArray() as Matrix2d,
      weights: matrix(layer.weights)
        .map(() =>
          random(
            (-1 / Math.sqrt(layer.weights.length)) * factor,
            (1 / Math.sqrt(layer.weights.length)) * factor
          )
        )
        .toArray() as Matrix2d,
    })),
  };
}

function addSystems(a: CutieAi, b: CutieAi): CutieAi {
  return {
    action: a.action.map((_, layerIndex) => ({
      biases: add(
        a.action[layerIndex].biases,
        b.action[layerIndex].biases
      ) as Matrix2d,
      weights: add(
        a.action[layerIndex].weights,
        b.action[layerIndex].weights
      ) as Matrix2d,
    })),
    target: a.target.map((_, layerIndex) => ({
      biases: add(
        a.target[layerIndex].biases,
        b.target[layerIndex].biases
      ) as Matrix2d,
      weights: add(
        a.target[layerIndex].weights,
        b.target[layerIndex].weights
      ) as Matrix2d,
    })),
  };
}

// eslint-disable-next-line no-unused-vars
function mapSystem(ai: CutieAi, cb: (value: number) => number): CutieAi {
  return {
    action: ai.action.map((layer) => ({
      biases: matrix(layer.biases).map(cb).toArray() as Matrix2d,
      weights: matrix(layer.weights).map(cb).toArray() as Matrix2d,
    })),
    target: ai.target.map((layer) => ({
      biases: matrix(layer.biases).map(cb).toArray() as Matrix2d,
      weights: matrix(layer.weights).map(cb).toArray() as Matrix2d,
    })),
  };
}

export function mutate(ai: CutieAi, factor: number): CutieAi {
  const newSystem = addSystems(ai, getRandomSystem(factor));

  return mapSystem(newSystem, (value) => limit(value, 2));
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1));
}
