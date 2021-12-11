import { Chart, registerables } from "chart.js";
import React from "react";
import { PageContainer } from "../components/PageContainer";
import { theme } from "../components/theme";

Chart.register(...registerables);

export interface TrainPageProps {
  data: number[];
}

export const TrainPage: React.FC<TrainPageProps> = ({ data }) => {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    // eslint-disable-next-line no-new
    new Chart(canvas.current, {
      data: {
        datasets: [
          {
            data,
            backgroundColor: theme.primary.toString(),
            borderColor: theme.primary.toString(),
            borderWidth: 2,
            label: "High score over time",
            pointRadius: 0,
            tension: 0.1,
          },
        ],
        labels: Array(data.length)
          .fill(0)
          .map((_, index) => index),
      },
      type: "line",
    });
  }, []);

  return (
    <PageContainer>
      <canvas height="800" width="1024" ref={canvas} />
    </PageContainer>
  );
};
