import React from "react";
import { CutieAi, getRandomCutieAi, mutate } from "../core/ai";
import { LoadingPage } from "../pages/Loading";
import { simPopulation } from "../utils";

const populationSize = 100;
const maxIterations = 8e3;
const generations = 500;
const elite = 10;

export const Train: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const population = React.useRef<CutieAi[]>(null);
  const momentumCounter = React.useRef(0);
  const lastHighScore = React.useRef(0);

  React.useEffect(() => {
    if (population.current === null) {
      population.current = Array(populationSize).fill(0).map(getRandomCutieAi);
    }

    if (progress < 1) {
      const t0 = performance.now();
      const populationData = simPopulation(population.current, {
        maxIterations,
        onCutieSimFinish: () => undefined,
        seed: 142398,
      })
        .map((aiScoreData, index) => ({
          ai: population.current[index],
          ...aiScoreData,
        }))
        .sort((a, b) => (a.score < b.score ? 1 : -1));

      const best = populationData.slice(0, elite);

      if (lastHighScore.current === populationData[0].score) {
        momentumCounter.current++;
      } else {
        momentumCounter.current = 0;
      }
      lastHighScore.current = populationData[0].score;

      console.log(`Highest score: ${lastHighScore.current}`);
      population.current = best.map((aiScoreData) => aiScoreData.ai);

      while (population.current.length !== populationSize) {
        population.current.push(
          ...best.map((aiScoreData) =>
            mutate(aiScoreData.ai, momentumCounter.current === 5 ? 1e3 : 1e1)
          )
        );
      }
      const t1 = performance.now();

      console.log(`Simulation took ${t1 - t0}ms`);
      localStorage.setItem("best", JSON.stringify(populationData[0].ai));
      //   if (momentumCounter.current > 40) {
      // setProgress(1);
      //   } else {
      setProgress((prevProgress) => prevProgress + 1 / generations);
      //   }
    }
  }, [progress]);

  return <LoadingPage progress={progress} />;
};
Train.displayName = "Train";
