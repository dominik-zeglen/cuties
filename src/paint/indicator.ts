import { theme } from "../components/theme";
import { Entity } from "../core/entities/entity";
import { add, toCartesian } from "../core/r2";

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
    opts.entity.position.x,
    opts.entity.position.y,
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
    context.moveTo(opts.entity.position.x, opts.entity.position.y);
    const angleIndicator = add(
      toCartesian({
        r: 20,
        angle: opts.entity.angle,
      }),
      opts.entity.position
    );
    context.lineTo(angleIndicator.x, angleIndicator.y);
    context.stroke();
  }
}
