/* eslint-disable no-restricted-globals */

import { CutieAi } from "../core/ai";
import { getSim } from "../utils";

export interface PopulationSimMsg {
  simIndex: number;
  populationSizes: number[];
}
export interface PopulationSimInitMsg {
  sims: number;
  maxIterations: number;
  initialAi: CutieAi;
  points: number;
}

self.onmessage = (event: MessageEvent<PopulationSimInitMsg>) => {
  for (let simIndex = 0; simIndex < event.data.sims; simIndex++) {
    const populationSizes = getSim(
      event.data.maxIterations,
      event.data.points,
      event.data.initialAi
    );
    self.postMessage({
      simIndex: simIndex + 1,
      populationSizes,
    } as PopulationSimMsg);
  }
};
