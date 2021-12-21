/* eslint-disable no-restricted-globals */

import maxBy from "lodash/maxBy";
import { shuffle } from "lodash";
import { baseSystem, CutieAi, getInputMatrix, sgd } from "../core/ai";
import { pelletValue, Score, TrainingSim } from "../core/sim/training";
import { Cutie, getInput } from "../core/entities/cutie";
import { Sim } from "../core/sim";
import { Waste } from "../core/entities/waste";
import { getCutieInput } from "../core/sim/sim";

export interface GenerationSimData {
  ai: CutieAi;
  iteration: number;
  score: number;
}

export type CheckResponse = GenerationSimData;
export interface TrainInitMsg {
  maxIterations: number;
}

const simStep = 1;
const simNextIterations = 1;
const batchSize = 200;

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
  const scoreForDistance = (-2 * score.distance) / (400 * 1.41);
  const scoreForEggs = score.eggs;
  const scoreForEatenPellets = score.eaten * 10;
  // const scoreForSpeed =
  //   -sum(
  //     score.speed.map((it, i) =>
  //       i === 0 ? it : it - score.speed[i - 1] / 500
  //     )
  //   ) / 2;
  const scoreForCurrentPellet =
    ((pelletValue - score.currentFood) / pelletValue) * 7;

  return (
    scoreForDistance +
    scoreForEggs +
    scoreForEatenPellets +
    // scoreForSpeed +
    scoreForCurrentPellet
  );
}

self.onmessage = (event: MessageEvent<TrainInitMsg>) => {
  let ai = baseSystem;
  let simIndex = 0;
  let sim = new TrainingSim(ai, simIndex);

  for (let i = 0; i <= event.data.maxIterations; i++) {
    const cutie: Cutie = sim.getById(0);
    if (!cutie) {
      console.log("next sim");
      simIndex++;
      sim = new TrainingSim(ai, simIndex % 4);
      continue;
    }

    const trainData: Array<Record<"input" | "output", number[]>> = [];

    if (sim.iteration % simStep === 0) {
      const simData = Array(5)
        .fill(0)
        .map((_, angleIndex) =>
          Array(2)
            .fill(0)
            .map((__, eatIndex) =>
              Array(5)
                .fill(0)
                .map((___, speedIndex) =>
                  Array(3)
                    .fill(0)
                    .map((____, layEggIndex) => {
                      const angleOutput = (angleIndex / 2 - 1) / 4;
                      const eatOutput = eatIndex ? 1 : -1;
                      const speedOutput = speedIndex / 2 - 1;
                      const layEggOutput = layEggIndex ? 1 : -1;

                      const branchedSim = sim.copy();
                      branchedSim.simCutie = simCutieWithoutInput;
                      branchedSim.getById<Cutie>(0).thoughts.angle =
                        angleOutput;
                      branchedSim.getById<Cutie>(0).thoughts.eat = eatOutput;
                      branchedSim.getById<Cutie>(0).thoughts.speed =
                        speedOutput;
                      branchedSim.getById<Cutie>(0).thoughts.layEgg =
                        layEggOutput;

                      for (let it = 0; it < simNextIterations; it++) {
                        if (!branchedSim.getById(0)) {
                          break;
                        }
                        branchedSim.next();
                      }

                      return {
                        angleOutput,
                        eatOutput,
                        speedOutput,
                        layEggOutput,
                        score: getScore(branchedSim.getScore()),
                      };
                    })
                )
                .flat()
            )
            .flat()
        )
        .flat();

      const best = maxBy(simData, "score");
      trainData.push({
        input: getInputMatrix(getInput(cutie, getCutieInput(cutie, sim)))[0],
        output: [
          best.angleOutput,
          best.speedOutput,
          best.eatOutput,
          best.layEggOutput,
        ],
      });
    }

    if (sim.iteration % batchSize === 0) {
      shuffle(trainData).forEach((data) => {
        ai = sgd(ai, data.input, data.output, 1e-1);
      });

      cutie.ai = ai;

      self.postMessage({
        iteration: i,
        ai,
        score: getScore(sim.getScore()),
      } as CheckResponse);
    }

    sim.next();
  }
};
