import sum from "lodash/sum";
import { CutieAi } from "./core/ai";
import { Sim } from "./core/sim";
import { TrainingSim } from "./core/sim/training";

export function transpose<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

export function getSim(iterations: number): Promise<number[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sim = new Sim(500, 500);
      const population = Array(iterations / 100).fill(0);
      let oldest = 0;
      for (let it = 0; it < iterations; it++) {
        sim.next();
        sim.entityLoader.cuties.forEach((cutie) => {
          if (it - cutie.createdAt > oldest) {
            oldest = it - cutie.createdAt;
          }
        });

        if (it % 100 === 0) {
          population[it / 100] = sim.entityLoader.cuties.length;
        }
      }

      resolve(population);
    }, 0);
  });
}

export interface SimPopulationOpts {
  maxIterations: number;
  seed: number;
  // eslint-disable-next-line no-unused-vars
  onCutieSimFinish: (index: number) => void;
}

export interface SimPopulation {
  iterations: number;
  score: number;
}

export function simPopulation(
  population: CutieAi[],
  opts: SimPopulationOpts
): SimPopulation[] {
  return population.map((ai) => {
    const sim = new TrainingSim(400, 400, ai);

    let it = 0;
    for (; it < opts.maxIterations; it++) {
      sim.next();
      if (
        sim.entityLoader.food.length === 0 ||
        sim.entityLoader.cuties.length === 0
      ) {
        break;
      }
    }

    const leftFood = sum(sim.entityLoader.food.map((pellet) => pellet.value));

    const scoreForFood = sim.initialFood - leftFood;
    const scoreForIts = leftFood === 0 ? opts.maxIterations - it : 0;
    const scoreForEggs = sim.eggs ** 2 * 100;

    const score = scoreForFood + scoreForIts + scoreForEggs;

    opts.onCutieSimFinish(score);

    return {
      iterations: it,
      score,
    };
  });
}
