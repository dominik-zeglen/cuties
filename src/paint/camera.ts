import { RefObject } from "react";
import { Point } from "../core/r2";
import { Sim } from "../core/sim";

export interface Camera {
  height: number;
  width: number;
  sim: RefObject<Sim>;
  viewPort: Record<"start" | "end", Point>;
}

export function moveCamera(
  camera: RefObject<Camera>,
  context: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  camera.current.viewPort.start.x += x;
  camera.current.viewPort.start.y += y;
  camera.current.viewPort.end.x += x;
  camera.current.viewPort.end.y += y;

  if (camera.current.viewPort.start.x < 0) {
    camera.current.viewPort.end.x = camera.current.width;
    camera.current.viewPort.start.x = 0;
  }
  if (camera.current.viewPort.start.y < 0) {
    camera.current.viewPort.end.y = camera.current.height;
    camera.current.viewPort.start.y = 0;
  }

  if (camera.current.viewPort.end.x > camera.current.sim.current.bounds[1].x) {
    camera.current.viewPort.end.x = camera.current.sim.current.bounds[1].x;
    camera.current.viewPort.start.x =
      camera.current.viewPort.end.x - camera.current.width;
  }
  if (camera.current.viewPort.end.y > camera.current.sim.current.bounds[1].y) {
    camera.current.viewPort.end.y = camera.current.sim.current.bounds[1].y;
    camera.current.viewPort.start.y =
      camera.current.viewPort.end.y - camera.current.height;
  }

  context.setTransform(
    1,
    0,
    0,
    1,
    -camera.current.viewPort.start.x,
    -camera.current.viewPort.start.y
  );
}
