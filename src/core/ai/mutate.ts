import { add, matrix, random } from "mathjs";
import { CutieAi, Matrix2d } from "./types";
import { baseSystem } from "./ai";

function getRandomSystem(divide: number): CutieAi {
  return {
    action: baseSystem.action.map((layer) => ({
      biases: matrix(layer.biases)
        .map(() => random(-divide, divide))
        .toArray() as Matrix2d,
      weights: matrix(layer.weights)
        .map(() => random(-divide, divide))
        .toArray() as Matrix2d,
    })),
    target: baseSystem.target.map((layer) => ({
      biases: matrix(layer.biases)
        .map(() => random(-divide, divide))
        .toArray() as Matrix2d,
      weights: matrix(layer.weights)
        .map(() => random(-divide, divide))
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

export function mutate(ai: CutieAi, factor: number): CutieAi {
  return addSystems(ai, getRandomSystem(factor));
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1e-1));
}
