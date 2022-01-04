import React, { MouseEventHandler } from "react";
import { StyleSheet, css } from "aphrodite";
import Color from "color";
import minBy from "lodash/minBy";
import { Sim } from "./core/sim";
import { theme } from "./components/theme";
import { len, sub } from "./core/r2";
import { useWorker } from "./hooks/useWorker";
import { RenderCameraMoveMsg, RenderUpdateMsg } from "./workers/render";

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

const width = theme.container.default;
const height = 800;
const speed = 10;

function handlePause(event: KeyboardEvent) {
  if (event.key === " ") {
    (window.cuties.sim.current as any).paused = !(
      window.cuties.sim.current as any
    ).paused;
  }
}

export const Cuties: React.FC<CutiesProps> = () => {
  const interval = React.useRef<number>(null);
  const sim = React.useRef<Sim>(new Sim(2000, 2000));
  // const sim = React.useRef<Sim>(
  //   new TrainingSim(JSON.parse(localStorage.getItem("best")), 0)
  // );
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
  const renderWorker = useWorker(
    new Worker(new URL("./workers/render.ts", import.meta.url))
  );

  React.useEffect(() => {
    const offscreen = canvas.current.transferControlToOffscreen();
    renderWorker.current.postMessage(
      {
        bounds: sim.current.bounds,
        canvas: offscreen,
        type: "init",
      },
      [offscreen]
    );
  }, []);

  const paint = () => {
    if (!canvas.current) {
      return;
    }

    renderWorker.current.postMessage({
      type: "update",
      cuties: sim.current.entityLoader.cuties.map((cutie) => cutie.drawable()),
      food: sim.current.entityLoader.food.map((food) => food.drawable()),
      eggs: sim.current.entityLoader.eggs.map((egg) => egg.drawable()),
      flowers: sim.current.entityLoader.flowerRoots.map((flower) =>
        flower.drawable()
      ),
      waste: sim.current.entityLoader.waste.map((waste) => waste.drawable()),
      remains: sim.current.entityLoader.remains.map((remains) =>
        remains.drawable()
      ),
    } as RenderUpdateMsg);

    window.requestAnimationFrame(paint);
  };

  React.useEffect(() => {
    interval.current = setInterval(
      sim.current.next,
      1000 / 60 / speed
    ) as unknown as number;
    window.requestAnimationFrame(paint);
    document.addEventListener("keydown", handlePause);

    return () => {
      clearInterval(interval.current);
      document.removeEventListener("keydown", handlePause);
    };
  }, []);

  const handleClick: MouseEventHandler<HTMLCanvasElement> = React.useCallback(
    (event) => {
      // const rect = event.currentTarget.getBoundingClientRect();
      // const point = {
      //   x: event.clientX - rect.left + camera.current.viewPort.start.x,
      //   y: event.clientY - rect.top + camera.current.viewPort.start.y,
      // };
      // const { id, dist } = minBy(
      //   sim.current.entities.map((ent) => ({
      //     id: ent.id,
      //     dist: len(sub(ent.position, point)),
      //   })),
      //   "dist"
      // );
      // if (dist < 20) {
      //   window.cuties.selected = sim.current.entities.find(
      //     (ent) => ent.id === id
      //   );
      // } else {
      //   window.cuties.selected = null;
      // }
    },
    []
  );

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    if (event.buttons === 1) {
      renderWorker.current.postMessage({
        type: "move-camera",
        x: -event.movementX,
        y: -event.movementY,
      } as RenderCameraMoveMsg);
    }
  };

  return (
    <canvas
      className={css(styles.canvas)}
      height={height}
      width={width}
      ref={canvas}
      onClick={handleClick}
      onMouseDown={handleClick}
      onMouseMove={handleMouseMove}
    />
  );
};

Cuties.displayName = "Cuties";
