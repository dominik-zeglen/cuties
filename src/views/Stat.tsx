import React from "react";
import { StatPage } from "../stats/StatPage";
import { getSim } from "../utils";

const sims = 10;
const iterations = 1e4;

export const Stat: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const [data, setData] = React.useState<number[][]>();
  const interval = React.useRef<number>(null);

  React.useEffect(() => {
    interval.current = setTimeout(async () => {
      const data: number[][] = Array(sims).fill([]);

      for (let index = 0; index < sims; index++) {
        data[index] = await getSim(iterations);
        setProgress((index + 1) / sims);
      }

      setData(data);
    }, 0) as unknown as number;

    return () => clearInterval(interval.current);
  }, []);

  return <StatPage data={data} progress={progress} />;
};
Stat.displayName = "Stat";
