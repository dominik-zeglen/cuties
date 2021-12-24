import { add, matrix, random } from "mathjs";
import { CutieAi, Matrix2d } from "./types";
import { baseSystem } from "./ai";

function getRandomSystem(divide: number): CutieAi {
  return baseSystem.map((layer) => ({
    biases: matrix(layer.biases)
      .map(() => random(-divide, divide))
      .toArray() as Matrix2d,
    weights: matrix(layer.weights)
      .map(() => random(-divide, divide))
      .toArray() as Matrix2d,
  }));
}

function addSystems(a: CutieAi, b: CutieAi): CutieAi {
  return a.map((_, layerIndex) => ({
    biases: add(a[layerIndex].biases, b[layerIndex].biases) as Matrix2d,
    weights: add(a[layerIndex].weights, b[layerIndex].weights) as Matrix2d,
  }));
}

export function mutate(ai: CutieAi, factor: number): CutieAi {
  return addSystems(ai, getRandomSystem(factor));
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1e-2));
}
