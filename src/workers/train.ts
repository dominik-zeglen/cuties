/* eslint-disable no-restricted-globals */

import { getRandomCutieAi, mutate } from "../core/ai";
import { simPopulation, SimPopulation } from "../utils";

export interface GenerationSimData {
  scores: Array<SimPopulation & { ai: number[][][] }>;
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
      onCutieSimFinish: () => undefined,
      seed: 142398,
    })
      .map((aiScoreData, index) => ({
        ai: population[index],
        ...aiScoreData,
      }))
      .sort((a, b) => (a.score < b.score ? 1 : -1));

    const best = populationData.slice(0, event.data.elite);
    console.log(best[0].score);

    if (lastHighScore === populationData[0].score) {
      momentumCounter++;
    } else {
      momentumCounter = 0;
    }
    lastHighScore = populationData[0].score;

    population = best.map((aiScoreData) => aiScoreData.ai);

    while (population.length !== event.data.populationSize) {
      population.push(
        ...best.map((aiScoreData) =>
          mutate(aiScoreData.ai, momentumCounter === 5 ? 1e3 : 1e1)
        )
      );
    }

    if (momentumCounter > 40) {
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
