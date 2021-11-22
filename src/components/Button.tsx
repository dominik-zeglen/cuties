import React from "react";
import { theme } from "./theme";
import { StyleSheet, css } from "aphrodite";
import clsx from "clsx";

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
  },
});

export const Button: React.FC<ButtonProps> = ({ className, ...props }) => (
  <button className={clsx(className, css(styles.button))} {...props} />
);
Button.displayName = "Button";
