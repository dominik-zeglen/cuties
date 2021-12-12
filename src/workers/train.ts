/* eslint-disable no-restricted-globals */

import maxBy from "lodash/maxBy";
import shuffle from "lodash/shuffle";
import { baseSystem, CutieAi, getInputMatrix, sgd } from "../core/ai";
import { pelletValue, Score, TrainingSim } from "../core/sim/training";
import { Cutie, getInput, rangeRadius } from "../core/entities/cutie";
import { getCutieInput } from "../core/sim/sim";
import { toPolar } from "../core/r2";

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

function getScore(score: Score): number {
  const scoreForDistance = (-2 * score.distance) / (400 * 1.41);
  const scoreForEggs = score.eggs;
  const scoreForEatenPellets = score.eaten * 10;
  const scoreForCurrentPellet =
    ((pelletValue - score.currentFood) / pelletValue) * 7;

  return (
    scoreForDistance +
    scoreForEggs +
    scoreForEatenPellets +
    scoreForCurrentPellet
  );
}

self.onmessage = (event: MessageEvent<TrainInitMsg>) => {
  let ai = baseSystem;
  let simIndex = 0;
  let sim = new TrainingSim(ai, simIndex);
  let trainData: Array<Record<"input" | "output", number[]>> = [];

  for (let i = 0; i <= event.data.maxIterations; i++) {
    const cutie: Cutie = sim.getById(0);
    if (!cutie) {
      console.log("next sim");
      simIndex++;
      sim = new TrainingSim(ai, simIndex % 4);
      continue;
    }

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
                      branchedSim.enableThinking = false;
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
      const nearestFood = sim.getNearestFood(cutie.position, rangeRadius);
      const nearestFoodPosition = nearestFood ? toPolar(nearestFood) : null;
      trainData.push({
        input: getInputMatrix(
          getInput(
            cutie,
            getCutieInput(
              cutie,
              sim,
              nearestFoodPosition,
              { angle: Math.random() - 0.5, r: Math.random() - 0.5 },
              { angle: Math.random() - 0.5, r: Math.random() - 0.5 }
            )
          )
        )[0],
        output: [
          best.angleOutput,
          best.speedOutput,
          best.eatOutput,
          best.layEggOutput,
          cutie.thoughts.attack,
        ],
      });
    }

    if (sim.iteration % batchSize === 0) {
      shuffle(trainData)
        .slice(0, trainData.length / 5)
        .forEach((data) => {
          ai = sgd(ai, data.input, data.output, 1e-3);
        });
      trainData = [];

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
