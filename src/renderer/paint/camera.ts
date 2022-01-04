import { Point } from "../../core/r2";

export interface Camera {
  height: number;
  width: number;
  viewPort: Record<"start" | "end", Point>;
}

export function moveCamera(
  camera: Camera,
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  bounds: [Point, Point]
) {
  camera.viewPort.start.x += x;
  camera.viewPort.start.y += y;
  camera.viewPort.end.x += x;
  camera.viewPort.end.y += y;

  if (camera.viewPort.start.x < bounds[0].x) {
    camera.viewPort.end.x = camera.width;
    camera.viewPort.start.x = bounds[0].x;
  }
  if (camera.viewPort.start.y < bounds[0].y) {
    camera.viewPort.end.y = camera.height;
    camera.viewPort.start.y = bounds[0].y;
  }

  if (camera.viewPort.end.x > bounds[1].x) {
    camera.viewPort.end.x = bounds[1].x;
    camera.viewPort.start.x = camera.viewPort.end.x - camera.width;
  }
  if (camera.viewPort.end.y > bounds[1].y) {
    camera.viewPort.end.y = bounds[1].y;
    camera.viewPort.start.y = camera.viewPort.end.y - camera.height;
  }

  context.setTransform(
    1,
    0,
    0,
    1,
    -camera.viewPort.start.x,
    -camera.viewPort.start.y
  );
}
