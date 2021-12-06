import { Entity } from "../core/entities/entity";

type Pellet = Entity & { value: number };

export interface DrawPelletOpts {
  pellet: Pellet;
  maxValue: number;
}

export function drawStaticPellet(
  context: CanvasRenderingContext2D,
  pellet: Entity
) {
  context.beginPath();
  context.ellipse(
    pellet.position.x,
    pellet.position.y,
    4,
    4,
    -1,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
}

export function drawPellet(
  context: CanvasRenderingContext2D,
  { pellet, maxValue }: DrawPelletOpts
) {
  if (pellet.value < 0) {
    return;
  }

  const size = (pellet.value / maxValue) * 4;

  context.beginPath();
  context.ellipse(
    pellet.position.x,
    pellet.position.y,
    size,
    size,
    -1,
    0,
    2 * Math.PI,
    false
  );
  context.fill();
}
