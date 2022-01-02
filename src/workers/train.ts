/* eslint-disable no-restricted-globals */

import { rootMeanSquare } from "simple-statistics";
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

self.onmessage = (event: MessageEvent<TrainInitMsg>) => {
  let population = Array(event.data.populationSize)
    .fill(0)
    .map(getRandomCutieAi);
  let iteration = 0;
  let momentumCounter = 0;
  let lastHighScore = 0;
  let populationData = null;

  while (iteration < event.data.generations) {
    populationData = simPopulation(population, {
      maxIterations: event.data.maxIterations,
    })
      .map((aiScoreData, index) => {
        const endScore = rootMeanSquare(
          aiScoreData.map((aiScore) => {
            const scoreForDistance = -(aiScore.score.distance * 2) / 400 / 1.41;
            const scoreForEggs = aiScore.score.eggs ** 2 / 10;
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
              (scoreForDistance +
                scoreForEatenPellets +
                // scoreForSpeed +
                scoreForCurrentPellet) *
              (1 + scoreForEggs)
            );
          })
        );

        return {
          ai: population[index],
          endScore,
          scores: aiScoreData,
        };
      })
      .sort((a, b) => (a.endScore < b.endScore ? 1 : -1));

    const best = populationData.slice(0, event.data.elite);
    console.log(best[0].endScore, best[0]);

    if (lastHighScore >= populationData[0].endScore) {
      momentumCounter++;
    } else {
      momentumCounter = 0;
    }
    lastHighScore = populationData[0].endScore;

    population = best.map((aiScoreData) => aiScoreData.ai);
    population.push(...best.map(getRandomCutieAi));

    if (momentumCounter > 5) {
      population.push(...best.map((aiScoreData) => mutate(aiScoreData.ai, 2)));
      population.push(...best.map((aiScoreData) => mutate(aiScoreData.ai, 1)));
    }

    while (population.length !== event.data.populationSize) {
      population.push(...best.map((aiScoreData) => mutate(aiScoreData.ai, 10)));
    }

    if (momentumCounter > event.data.momentumLimit) {
      iteration = event.data.generations;
    } else {
      iteration++;
    }

    self.postMessage({
      iteration,
      scores: populationData,
    });
  }
};
