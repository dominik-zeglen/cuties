import React from "react";
import { StyleSheet, css } from "aphrodite";
import clsx from "clsx";
import { theme } from "./theme";

export interface SliderProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}

const styles = StyleSheet.create({
  root: {
    "::-webkit-slider-thumb": {
      appearance: "none",
      backgroundColor: theme.primary.toString(),
      borderRadius: "100%",
      cursor: "pointer",
      width: 13,
      height: 13,
      position: "relative",
      top: -6,
    },
    "::-webkit-slider-runnable-track": {
      appearance: "none",
      backgroundColor: theme.primary.toString(),
      height: 2,
    },
    appearance: "none",
    backgroundColor: "transparent",
    width: 100,
  },
});

export const Slider: React.FC<SliderProps> = ({ className, ...props }) => (
  <input
    type="range"
    className={clsx(className, css(styles.root))}
    {...props}
  />
);
Slider.displayName = "Slider";
