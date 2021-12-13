import React from "react";
import { LoadingPage } from "../pages/Loading";
import { TrainPage } from "../pages/Train";
import type { CheckResponse, TrainInitMsg } from "../workers/train";

const opts: TrainInitMsg = {
  elite: 10,
  generations: 100,
  maxIterations: 8e3,
  momentumLimit: 20,
  populationSize: 100,
};

export const Train: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const [data, setData] = React.useState<number[]>([]);
  const worker = React.useRef<Worker>(null);

  React.useEffect(() => {
    worker.current = new Worker(
      new URL("../workers/train.ts", import.meta.url)
    );

    worker.current.postMessage(opts);

    worker.current.addEventListener(
      "message",
      (event: MessageEvent<CheckResponse>) => {
        const best = event.data.scores[0];

        setProgress(event.data.iteration / opts.generations);
        setData((prevData) => [...prevData, best.score]);
        localStorage.setItem("best", JSON.stringify(best.ai));
      }
    );

    return () => worker.current.terminate();
  }, []);

  if (progress < 1) {
    return <LoadingPage progress={progress} />;
  }

  return <TrainPage data={data} />;
};
Train.displayName = "Train";
