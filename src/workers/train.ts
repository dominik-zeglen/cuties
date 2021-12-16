/* eslint-disable no-restricted-globals */

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
      .map((aiScoreData, index) => ({
        ai: population[index],
        endScore:
          aiScoreData.score.distance / 10 +
          aiScoreData.score.eaten +
          aiScoreData.score.eggs,
        ...aiScoreData,
      }))
      .sort((a, b) => (a.endScore < b.endScore ? 1 : -1));

    const best = populationData.slice(0, event.data.elite);
    console.log(best[0].score);

    if (lastHighScore === populationData[0].endScore) {
      momentumCounter++;
    } else {
      momentumCounter = 0;
    }
    lastHighScore = populationData[0].endScore;

    population = best.map((aiScoreData) => aiScoreData.ai);
    population.push(...best.map(getRandomCutieAi));

    if (momentumCounter === 5) {
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e1))
      );
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e2))
      );
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e4))
      );
      population.push(
        ...best.map((aiScoreData) =>
          mutate(aiScoreData.ai, Math.random() - 0.5)
        )
      );
    }

    while (population.length !== event.data.populationSize) {
      population.push(
        ...best.map((aiScoreData) => mutate(aiScoreData.ai, 1e3))
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
