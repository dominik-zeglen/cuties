import React from "react";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import "../components/Loader";
import { Loader } from "../components/Loader";
import "./PopulationChart";
import { PopulationChart } from "./PopulationChart";
import { useHistory } from "react-router-dom";

export interface StatPageProps {
  data: number[][] | undefined;
  progress: number;
}

export const StatPage: React.FC<StatPageProps> = ({ data, progress }) => {
  const history = useHistory();

  return (
    <Container>
      <Button style={{ marginBottom: 24 }} onClick={() => history.push("/")}>
        Back
      </Button>
      {data ? (
        <PopulationChart data={data} />
      ) : (
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
      )}
    </Container>
  );
};
