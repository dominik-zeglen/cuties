import React from "react";
import { StyleSheet, css } from "aphrodite";
import clsx from "clsx";
import { theme } from "./theme";

export interface SwitchProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}

const styles = StyleSheet.create({
  root: {
    ":after": {
      backgroundColor: theme.background.toString(),
      border: `1px solid ${theme.primary.toString()}`,
      borderRadius: "100%",
      width: 6,
      height: 6,
      content: "''",
      position: "absolute",
      top: 3,
      left: 3,
      transition: theme.transition,
    },
    ":checked:after": {
      backgroundColor: theme.primary.toString(),
      left: 27,
    },
    appearance: "none",
    backgroundColor: theme.background.toString(),
    border: `1px solid ${theme.primary.toString()}`,
    borderRadius: "10px",
    cursor: "pointer",
    width: 40,
    height: 16,
    position: "relative",
  },
});

export const Switch: React.FC<SwitchProps> = ({ className, ...props }) => (
  <input
    type="checkbox"
    className={clsx(className, css(styles.root))}
    {...props}
  />
);
Switch.displayName = "Switch";
