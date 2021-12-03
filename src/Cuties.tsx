import React, { MouseEventHandler } from "react";
import { StyleSheet, css } from "aphrodite";
import Color from "color";
import minBy from "lodash/minBy";
import { Sim } from "./core/sim";
import { theme } from "./components/theme";
import { add, len, sub, toCartesian } from "./core/r2";
import { drawIndicator } from "./paint";
import { maxValue } from "./core/entities/waste";
import { defaultInitialFoodValue } from "./core/entities/food";

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

export const Cuties: React.FC<CutiesProps> = () => {
  const interval = React.useRef<number>(null);
  const sim = React.useRef<Sim>(new Sim(width, height));
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const colormap = React.useRef(createColormap(2));
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        canvas: {
          backgroundColor: colormap.current[0],
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

    context.strokeStyle = theme.primary.string();
    sim.current.entityLoader.food.forEach((food) => {
      const size = (food.value / defaultInitialFoodValue) * 3 + 1;

      context.beginPath();
      context.ellipse(
        food.position.x,
        food.position.y,
        size,
        size,
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
        egg.position.x,
        egg.position.y,
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
      const size = (waste.value / maxValue) * 3 + 1;

      context.beginPath();
      context.ellipse(
        waste.position.x,
        waste.position.y,
        size,
        size,
        -1,
        0,
        2 * Math.PI,
        false
      );
      context.fill();
    });

    context.save();
    context.strokeStyle = theme.primary.string();
    context.lineWidth = 2;
    sim.current.entityLoader.flowers.forEach((flower) => {
      context.beginPath();
      const directionVector = toCartesian({
        angle: flower.angle,
        r: 5,
      });
      const beginPos = sub(flower.position, directionVector);
      const endPos = add(flower.position, directionVector);
      context.moveTo(beginPos.x, beginPos.y);
      context.lineTo(endPos.x, endPos.y);
      context.stroke();
    });
    context.restore();

    context.strokeStyle = theme.secondary.string();
    sim.current.entityLoader.cuties.forEach((cutie) => {
      context.beginPath();
      context.rect(cutie.position.x - 2, cutie.position.y - 2, 5, 5);
      context.stroke();
    });

    if (window.cuties.selected) {
      if (window.cuties.selected.shouldDelete) {
        window.cuties.selected = undefined;
      } else {
        drawIndicator(context, {
          entity: window.cuties.selected,
          width,
          height,
        });
      }
    }

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

  const handleClick: MouseEventHandler<HTMLCanvasElement> = React.useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const { id } = minBy(
        sim.current.entities.map((ent) => ({
          id: ent.id,
          dist: len(sub(ent.position, point)),
        })),
        "dist"
      );
      window.cuties.selected = sim.current.entities.find(
        (ent) => ent.id === id
      );
    },
    []
  );

  return (
    <canvas
      className={css(styles.canvas)}
      height={height}
      width={width}
      ref={canvas}
      onClick={handleClick}
    />
  );
};

Cuties.displayName = "Cuties";
