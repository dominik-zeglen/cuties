import { Entity } from "../core/entities/entity";

type Pellet = Entity & { value: number };

export interface DrawStaticPelletOpts {
  color: string;
  pellet: Entity;
  size: number;
}

export interface DrawPelletOpts extends Omit<DrawStaticPelletOpts, "size"> {
  maxValue: number;
  pellet: Pellet;
}

export function drawStaticPellet(
  context: CanvasRenderingContext2D,
  { color, pellet, size }: DrawStaticPelletOpts
) {
  context.fillStyle = color;
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

export function drawPellet(
  context: CanvasRenderingContext2D,
  { pellet, maxValue, ...rest }: DrawPelletOpts
) {
  if (pellet.value < 0) {
    return;
  }

  const size = (pellet.value / maxValue) * 4;

  drawStaticPellet(context, {
    ...rest,
    pellet,
    size,
  });
}
