import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Loader } from "../components/Loader";

export interface LoadingPageProps {
  progress: number;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ progress }) => {
  const history = useHistory();

  return (
    <Container>
      <Button style={{ marginBottom: 24 }} onClick={() => history.goBack()}>
        Back
      </Button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Loader progress={progress} />
      </div>
    </Container>
  );
};
