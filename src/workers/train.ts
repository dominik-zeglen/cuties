/* eslint-disable no-restricted-globals */

import { sum } from "simple-statistics";
import { getRandomCutieAi, mutate } from "../core/ai";
import { simPopulation, SimPopulation } from "../utils";

export interface GenerationSimData {
  scores: Array<SimPopulation & { ai: number[][][]; endScore: number }>;
  iteration: number;
}

export type CheckResponse = GenerationSimData;
export interface TrainInitMsg {
  elite: number;
  generations: number;
  maxIterations: number;
  momentumLimit: number;
  populationSize: number;
}

let population = null;
let iteration = 0;
let momentumCounter = 0;
let lastHighScore = 0;
let populationData = null;

self.onmessage = (event: MessageEvent<TrainInitMsg>) => {
  population = Array(event.data.populationSize).fill(0).map(getRandomCutieAi);
  while (iteration < event.data.generations) {
    populationData = simPopulation(population, {
      maxIterations: event.data.maxIterations,
    })
      .map((aiScoreData, index) => {
        const endScore =
          sum(
            aiScoreData.map((aiScore) => {
              const scoreForDistance =
                -(aiScore.score.distance * 2) / 400 / 1.41;
              const scoreForEggs = aiScore.score.eggs;
              const scoreForEatenPellets = aiScore.score.eaten * 10;
              // const scoreForSpeed =
              //   -sum(
              //     aiScore.score.speed.map((it, i) =>
              //       i === 0 ? it : it - aiScore.score.speed[i - 1] / 500
              //     )
              //   ) / 2;
              const scoreForCurrentPellet =
                ((500 - aiScore.score.currentFood) / 500) * 7;

              return (
                scoreForDistance +
                scoreForEggs +
                scoreForEatenPellets +
                // scoreForSpeed +
                scoreForCurrentPellet
              );
            })
          ) / aiScoreData.length;

        return {
          ai: population[index],
          endScore,
          scores: aiScoreData,
        };
      })
      .sort((a, b) => (a.endScore < b.endScore ? 1 : -1));

    const best = populationData.slice(0, event.data.elite);
    console.log(best[0].endScore, best[0]);

    if (lastHighScore === populationData[0].endScore) {
      momentumCounter++;
    } else {
      momentumCounter = 0;
    }
    lastHighScore = populationData[0].endScore;

    population = best.map((aiScoreData) => aiScoreData.ai);
    population.push(...best.map(getRandomCutieAi));

    if (momentumCounter === 5) {
      // population.push(
      //   ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e1))
      // );
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e3, 4))
      );
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e5, 4))
      );
    }

    while (population.length !== event.data.populationSize) {
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e4))
      );
    }

    // if (momentumCounter > event.data.momentumLimit) {
    //   iteration = event.data.generations;
    // } else {
    iteration++;
    // }

    self.postMessage({
      iteration,
      scores: populationData,
    });
  }
};
