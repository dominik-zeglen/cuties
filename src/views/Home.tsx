import React from "react";
import { useHistory } from "react-router";
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
        <Button onClick={() => setKey(+new Date())}>Restart</Button>
      </div>
    </Container>
  );
};
