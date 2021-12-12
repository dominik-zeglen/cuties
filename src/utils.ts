import sum from "lodash/sum";
import { clone } from "mathjs";
import { CutieAi } from "./core/ai";
import { Sim } from "./core/sim";
import { TrainingSim } from "./core/sim/training";

export function transpose<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

export function getSim(
  iterations: number,
  points: number,
  initialAi: CutieAi
): number[] {
  const sim = new Sim(4000, 4000);
  sim.randomSpawns = false;
  sim.entityLoader.cuties.forEach((cutie) => {
    cutie.ai = clone(initialAi);
  });
  const retention = iterations / points;
  const population = Array(points).fill(0);

  for (let it = 0; it < iterations; it++) {
    sim.next();

    if (it % retention === 0) {
      population[it / retention] = sim.entityLoader.cuties.length;
    }
  }

  return population;
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
