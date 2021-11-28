import { theme } from "./components/theme";
import { Entity } from "./core/entities/entity";
import { add, toEuclidean } from "./core/r2";

interface DrawIndicatorOpts {
  entity: Entity & { angle?: number };
  width: number;
  height: number;
}

export function drawIndicator(
  context: CanvasRenderingContext2D,
  opts: DrawIndicatorOpts
) {
  context.strokeStyle = theme.primary.string();
  context.beginPath();
  context.ellipse(
    opts.entity.position.x + opts.width / 2 - 2,
    opts.entity.position.y + opts.height / 2 - 2,
    9,
    9,
    -1,
    0,
    2 * 3.141,
    false
  );
  context.stroke();

  if (opts.entity.angle !== undefined) {
    context.beginPath();
    context.moveTo(
      opts.entity.position.x + opts.width / 2 - 2,
      opts.entity.position.y + opts.height / 2 - 2
    );
    const angleIndicator = add(
      toEuclidean({
        r: 20,
        angle: opts.entity.angle,
      }),
      opts.entity.position
    );
    context.lineTo(
      angleIndicator.x + opts.width / 2 - 2,
      angleIndicator.y + opts.height / 2 - 2
    );
    context.stroke();
  }
}