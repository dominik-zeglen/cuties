import React from "react";
import { LoadingPage } from "../pages/Loading";
import type { CheckResponse, TrainInitMsg } from "../workers/train";

const opts: TrainInitMsg = {
  elite: 10,
  generations: 100,
  maxIterations: 8e3,
  momentumLimit: 40,
  populationSize: 100,
};

export const Train: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const worker = React.useRef<Worker>(null);

  React.useEffect(() => {
    worker.current = new Worker(
      new URL("../workers/train.ts", import.meta.url)
    );

    worker.current.postMessage(opts);

    worker.current.addEventListener(
      "message",
      (event: MessageEvent<CheckResponse>) => {
        setProgress(event.data.iteration / opts.generations);
      }
    );

    return () => worker.current.terminate();
  }, []);

  return <LoadingPage progress={progress} />;
};
Train.displayName = "Train";
