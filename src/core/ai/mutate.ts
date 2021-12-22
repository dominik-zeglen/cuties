import { add } from "mathjs";
import cloneDeep from "lodash/cloneDeep";
import { CutieAi, Matrix2d } from "./types";
import { baseSystem } from "./ai";

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

export function mutate(ai: CutieAi, factor: number, mutations = 1): CutieAi {
  return addSystems(ai, getRandomSystem(factor, mutations));
}

export function getRandomCutieAi(): CutieAi {
  return addSystems(baseSystem, getRandomSystem(1e2, 20));
}
