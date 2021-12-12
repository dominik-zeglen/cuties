import React from "react";
import { Loader } from "../components/Loader";
import { PageContainer } from "../components/PageContainer";
import { PopulationChart } from "./PopulationChart";

export interface StatPageProps {
  data: number[][] | undefined;
  progress: number;
  ratio: number;
}

export const StatPage: React.FC<StatPageProps> = ({
  data,
  progress,
  ratio,
}) => (
  <PageContainer>
    {progress === 1 ? (
      <PopulationChart data={data} ratio={ratio} />
    ) : (
      <Loader progress={progress} />
    )}
  </PageContainer>
);
