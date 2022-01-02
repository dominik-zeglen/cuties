import React from "react";
import { useHistory } from "react-router-dom";
import { StyleSheet, css } from "aphrodite";
import { Button } from "../components/Button";
import { Container } from "../components/Container";

export interface PageContainerProps {}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const history = useHistory();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        button: { marginBottom: 24 },
        container: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          flexDirection: "column",
        },
      }),
    []
  );

  return (
    <Container>
      <Button className={css(styles.button)} onClick={() => history.goBack()}>
        Back
      </Button>
      <div className={css(styles.container)}>{children}</div>
    </Container>
  );
};
PageContainer.displayName = "PageContainer";
