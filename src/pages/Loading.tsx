import React from "react";
import { Loader } from "../components/Loader";
import { PageContainer } from "../components/PageContainer";

export interface LoadingPageProps {
  progress: number;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  children,
  progress,
}) => (
  <PageContainer>
    <Loader progress={progress} />
    {children}
  </PageContainer>
);
