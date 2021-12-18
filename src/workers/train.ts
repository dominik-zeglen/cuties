/* eslint-disable no-restricted-globals */

import { sum } from "simple-statistics";
import cloneDeep from "lodash/cloneDeep";
import { getRandomCutieAi, mutate } from "../core/ai";
import { Score, TrainingSim } from "../core/sim/training";
import { simPopulation, SimPopulation } from "../utils";
import { Cutie } from "../core/entities/cutie";
import { Sim } from "../core/sim";
import { Waste } from "../core/entities/waste";

export interface GenerationSimData {
  scores: Array<SimPopulation & { ai: number[][][]; endScore: number }>;
  iteration: number;
}

export type CheckResponse = GenerationSimData;
export interface TrainInitMsg {}

const simStep = 50;
const simNextIterations = 100;

function simCutieWithoutInput(cutie: Cutie, sim: Sim): void {
  cutie.sim(null);
  if (cutie.wantsToLayEgg() && cutie.canLayEgg()) {
    sim.registerEntity(cutie.layEgg(sim.iteration));
  }

  if (cutie.shouldDumpWaste()) {
    const waste = cutie.dumpWaste();
    sim.registerEntity(waste);
  }

  if (cutie.shouldDelete) {
    const remains = new Waste({
      position: cutie.position,
    });
    remains.value = 100;
    sim.registerEntity(remains);
  }
}

function getScore(score: Score): number {
  const scoreForDistance = -(score.distance * 2) / 400 / 1.41;
  const scoreForEggs = score.eggs;
  const scoreForEatenPellets = score.eaten * 10;
  // const scoreForSpeed =
  //   -sum(
  //     score.speed.map((it, i) =>
  //       i === 0 ? it : it - score.speed[i - 1] / 500
  //     )
  //   ) / 2;
  const scoreForCurrentPellet = ((500 - score.currentFood) / 500) * 7;

  return (
    scoreForDistance +
    scoreForEggs +
    scoreForEatenPellets +
    // scoreForSpeed +
    scoreForCurrentPellet
  );
}

self.onmessage = (event: MessageEvent<TrainInitMsg>) => {
  const ai = getRandomCutieAi();
  let simIndex = 0;
  let sim = new TrainingSim(ai, simIndex);

  for (let i = 0; i < 1e7; i++) {
    if (!sim.getById(0)) {
      simIndex++;
      sim = new TrainingSim(ai, simIndex);
      continue;
    }

    if (sim.iteration % simStep === 0) {
      const scoresForAngleOutputs = Array(8)
        .fill(0)
        .map((_, index) => {
          console.log(sim.getById(0));
          const angleOutput = index / 4 - 1;

          const branchedSim = cloneDeep(sim);
          branchedSim.simCutie = simCutieWithoutInput;
          branchedSim.getById<Cutie>(0).thoughts.angle = angleOutput;

          for (let it = 0; it < simNextIterations; i++) {
            if (!branchedSim.getById(0)) {
              break;
            }
            branchedSim.next();
          }

          return getScore(branchedSim.getScore());
        });

      console.log(scoresForAngleOutputs);
    } else {
      sim.next();
    }
  }
};
