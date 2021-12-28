import { theme } from "../components/theme";
import { Cutie } from "../core/entities/cutie";
import { Entity } from "../core/entities/entity";
import {
  Flower,
  rangeRadius as flowerRangeRadius,
} from "../core/entities/flowers";
import { add, toCartesian } from "../core/r2";
import settings from "../core/settings";

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

  if (opts.entity instanceof Cutie) {
    context.strokeStyle = theme.tertiary.string();
    context.beginPath();
    context.ellipse(
      opts.entity.position.x,
      opts.entity.position.y,
      settings.cutie.range,
      settings.cutie.range,
      -1,
      0,
      2 * 3.141,
      false
    );
    context.stroke();
  } else if (opts.entity instanceof Flower) {
    context.strokeStyle = theme.tertiary.string();
    context.beginPath();
    context.ellipse(
      opts.entity.position.x,
      opts.entity.position.y,
      flowerRangeRadius,
      flowerRangeRadius,
      -1,
      0,
      2 * 3.141,
      false
    );
    context.stroke();
  }
}
