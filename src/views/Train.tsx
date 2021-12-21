import React from "react";
import { LoadingPage } from "../pages/Loading";
import { TrainPage } from "../pages/Train";
import type { CheckResponse, TrainInitMsg } from "../workers/train";

const opts: TrainInitMsg = {
  maxIterations: 1e5,
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
        setProgress(event.data.iteration / opts.maxIterations);
        // setData((prevData) => [...prevData, best.endScore]);
        console.log(event.data.score);

        localStorage.setItem("best", JSON.stringify(event.data.ai));
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
