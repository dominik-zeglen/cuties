import React from "react";
import { Button } from "../components/Button";
import settings from "../core/settings";
import { useWorker } from "../hooks/useWorker";
import { LoadingPage } from "../pages/Loading";
import { TrainPage } from "../pages/Train";
import type { CheckResponse, TrainInitMsg } from "../workers/train";

const opts: TrainInitMsg = {
  elite: 5,
  generations: 1000,
  maxIterations: settings.cutie.oldAge,
  momentumLimit: 50,
  populationSize: 50,
};

export const Train: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const [data, setData] = React.useState<number[]>([]);
  const worker = useWorker(
    new Worker(new URL("../workers/train.ts", import.meta.url))
  );

  React.useEffect(() => {
    worker.current.postMessage(opts);

    worker.current.addEventListener(
      "message",
      (event: MessageEvent<CheckResponse>) => {
        const best = event.data.scores[0];

        setProgress(event.data.iteration / opts.generations);
        setData((prevData) => [...prevData, best.endScore]);
        localStorage.setItem("best", JSON.stringify(best.ai));
      }
    );
  }, [worker]);

  const handleStop = () => {
    worker.current.terminate();
    setProgress(1);
  };

  if (progress < 1) {
    return (
      <LoadingPage progress={progress}>
        <div>
          <Button onClick={handleStop}>Stop</Button>
        </div>
      </LoadingPage>
    );
  }

  return <TrainPage data={data} />;
};
Train.displayName = "Train";
