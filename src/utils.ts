import { clone } from "mathjs";
import { CutieAi } from "./core/ai";
import { Sim } from "./core/sim";
import { Score, TrainingSim } from "./core/sim/training";

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
}

export interface SimPopulation {
  iterations: number;
  score: Score;
}

export function simPopulation(
  population: CutieAi[],
  opts: SimPopulationOpts
): SimPopulation[] {
  return population.map((ai) => {
    const sim = new TrainingSim(ai);

    let it = 0;
    for (; it < opts.maxIterations; it++) {
      sim.next();
      if (
        sim.entityLoader.cuties.length === 0 ||
        ((sim.pelletsEaten + 1) * 500) / (sim.iteration + 1) < 1
      ) {
        break;
      }
    }

    const score = sim.getScore();

    return {
      iterations: it,
      score,
    };
  });
}
