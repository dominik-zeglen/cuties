import React from "react";
import { StyleSheet, css } from "aphrodite";
import clsx from "clsx";
import { theme } from "./theme";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

const styles = StyleSheet.create({
  button: {
    ":hover": {
      background: theme.primary.toString(),
      color: theme.background.toString(),
    },
    appearance: "none",
    background: "none",
    border: `2px solid ${theme.primary.toString()}`,
    borderRadius: 8,
    cursor: "pointer",
    height: 48,
    padding: "4px 16px",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "0.1rem",
    color: theme.primary.toString(),
    transition: theme.transition,
    userSelect: "none",
  },
});

export const Button: React.FC<ButtonProps> = ({ className, ...props }) => (
  // eslint-disable-next-line react/button-has-type
  <button className={clsx(className, css(styles.button))} {...props} />
);
Button.displayName = "Button";
