import React from "react";
import { theme } from "./theme";

export const Container: React.FC = (props) => (
  <div
    {...props}
    style={{
      margin: `${theme.spacing * 3}px auto`,
      minHeight: `calc(100vh - ${(theme.spacing * 3) & 2})`,
      width: 1280,
    }}
  />
);
Container.displayName = "Container";
