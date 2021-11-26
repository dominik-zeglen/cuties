import React from "react";
import { theme } from "./components/theme";
import { StyleSheet, css } from "aphrodite";
import Color from "color";
import { Sim } from "./core/core";

function createColormap(nshades: number): string[] {
  return Array<Color>(nshades)
    .fill(theme.primary)
    .map((color, index) =>
      color
        .darken(1 - index / (nshades - 1))
        .rgb()
        .string()
    );
}

export interface CutiesProps {}

const width = 1024;
const height = 800;
const speed = 100;

export const Cuties: React.FC<CutiesProps> = ({}) => {
  const interval = React.useRef<number>(null);
  const sim = React.useRef<Sim>(new Sim(width, height));
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const colormap = React.useRef(createColormap(2));
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        canvas: {
          backgroundColor: colormap.current[0],
          pointerEvents: "none",
          height,
          width,
        },
      }),
    []
  );

  const paint = () => {
    if (!canvas.current) {
      return;
    }

    const context = canvas.current.getContext("2d");
    context.clearRect(0, 0, canvas.current.width, canvas.current.height);
    context.strokeStyle = theme.secondary.string();

    sim.current.entityLoader.cuties.forEach((cutie) => {
      context.beginPath();
      context.rect(
        cutie.position.x + width / 2 - 2,
        cutie.position.y + height / 2 - 2,
        5,
        5
      );
      context.stroke();
    });

    context.strokeStyle = theme.primary.string();
    sim.current.entityLoader.food.forEach((food) => {
      context.beginPath();
      context.ellipse(
        food.position.x + width / 2 - 2,
        food.position.y + height / 2 - 2,
        3,
        3,
        -1,
        0,
        2 * 3.141,
        false
      );
      context.stroke();
    });

    context.strokeStyle = theme.tertiary.string();
    sim.current.entityLoader.eggs.forEach((egg) => {
      context.beginPath();
      context.ellipse(
        egg.position.x + width / 2 - 2,
        egg.position.y + height / 2 - 2,
        3,
        3,
        -1,
        0,
        2 * 3.141,
        false
      );
      context.stroke();
    });

    context.fillStyle = theme.entities.dump.string();
    sim.current.entityLoader.waste.forEach((waste) => {
      context.beginPath();
      context.ellipse(
        waste.position.x + width / 2 - 2,
        waste.position.y + height / 2 - 2,
        3,
        3,
        -1,
        0,
        2 * 3.141,
        false
      );
      context.fill();
    });

    window.requestAnimationFrame(paint);
  };

  React.useEffect(() => {
    interval.current = setInterval(
      sim.current.next,
      1000 / 60 / speed
    ) as unknown as number;
    paint();

    return () => clearInterval(interval.current);
  }, []);

  return (
    <canvas
      className={css(styles.canvas)}
      height={height}
      width={width}
      ref={canvas}
    />
  );
};

Cuties.displayName = "Cuties";
