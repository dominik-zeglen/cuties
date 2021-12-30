import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { theme } from "../components/theme";
import { Cuties } from "../Cuties";

export const Home: React.FC = () => {
  const history = useHistory();
  const [key, setKey] = React.useState(+new Date());

  return (
    <Container>
      <Cuties key={key} />
      <div
        style={{
          display: "flex",
          gap: theme.spacing * 3,
          marginTop: theme.spacing * 3,
        }}
      >
        <Button onClick={() => history.push("/stat")}>Stats</Button>
        <Button onClick={() => history.push("/models")}>Models</Button>
        <Button onClick={() => history.push("/train")}>Train</Button>
        <Button onClick={() => setKey(+new Date())}>Restart</Button>
        <Button onClick={() => window.cuties.sim.pause()}>Pause</Button>
        <Button onClick={() => window.cuties.sim.run()}>Run</Button>
        <Button
          onClick={() =>
            (window.cuties.sim.current as any).entityLoader.cuties.forEach(
              (cutie) => {
                cutie.ai = JSON.parse(localStorage.getItem("best"));
              }
            )
          }
        >
          Load
        </Button>
      </div>
    </Container>
  );
};
