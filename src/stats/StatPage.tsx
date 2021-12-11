import React from "react";
import { Loader } from "../components/Loader";
import { PageContainer } from "../components/PageContainer";
import { PopulationChart } from "./PopulationChart";

export interface StatPageProps {
  data: number[][] | undefined;
  progress: number;
}

export const StatPage: React.FC<StatPageProps> = ({ data, progress }) => (
  <PageContainer>
    {data ? <PopulationChart data={data} /> : <Loader progress={progress} />}
  </PageContainer>
);
