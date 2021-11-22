import { Chart, ChartDataset, registerables } from "chart.js";
import React from "react";
import { mean } from "simple-statistics";
import { theme } from "../components/theme";
import { transpose } from "../utils";

Chart.register(...registerables);

export interface PopulationChartProps {
  data: number[][];
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ data }) => {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (data) {
      new Chart(canvas.current, {
        data: {
          datasets: [
            ...data.map((data, index) => {
              const color = theme.primary.rotate(index * 8);

              return {
                backgroundColor: color.alpha(0.6).toString(),
                borderColor: color.alpha(0.6).toString(),
                borderWidth: 2,
                pointRadius: 0,
                data,
                label: `#${index + 1}`,
              } as ChartDataset<"line", number[]>;
            }),
            {
              backgroundColor: theme.primary.rotate(-180).toString(),
              borderColor: theme.primary.rotate(-180).toString(),
              borderWidth: 3,
              pointRadius: 0,
              label: "mean",
              data: transpose(data).map((iteration) => mean(iteration)),
            },
          ],
          labels: Array(data[0].length)
            .fill(0)
            .map((_, index) => (index + 1).toString()),
        },
        type: "line",
      });
    }
  }, [data]);

  return <canvas height="800" width="1200" ref={canvas} />;
};
