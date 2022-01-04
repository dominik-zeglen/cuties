import { Drawable } from "../drawable";

type Pellet = Drawable & { value: number };

export interface DrawStaticPelletOpts {
  color: string;
  pellet: Drawable;
  size: number;
}

export interface DrawPelletOpts extends Omit<DrawStaticPelletOpts, "size"> {
  maxValue: number;
  pellet: Pellet;
}

export function drawStaticPellet(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  { color, pellet, size }: DrawStaticPelletOpts
) {
  if (size < 0) {
    return;
  }

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
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  { pellet, maxValue, ...rest }: DrawPelletOpts
) {
  const size = (pellet.value / maxValue) * 4;

  drawStaticPellet(context, {
    ...rest,
    pellet,
    size,
  });
}
