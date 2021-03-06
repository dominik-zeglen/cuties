import React from "react";
import { baseSystem } from "../core/ai";
import { StatPage } from "../stats/StatPage";
import { PopulationSimInitMsg, PopulationSimMsg } from "../workers/population";

const opts: PopulationSimInitMsg = {
  sims: 3,
  maxIterations: 1e5,
  initialAi: baseSystem,
  points: 200,
};

export const Stat: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const [data, setData] = React.useState<number[][]>([]);
  const worker = React.useRef<Worker>(null);

  React.useEffect(() => {
    worker.current = new Worker(
      new URL("../workers/population.ts", import.meta.url)
    );

    worker.current.postMessage(opts);

    worker.current.addEventListener(
      "message",
      (event: MessageEvent<PopulationSimMsg>) => {
        setData((prevData) => [...prevData, event.data.populationSizes]);
        setProgress(event.data.simIndex / opts.sims);
      }
    );

    return () => worker.current.terminate();
  }, []);

  return (
    <StatPage
      data={data}
      progress={progress}
      ratio={opts.maxIterations / opts.points}
    />
  );
};
Stat.displayName = "Stat";
