import { theme } from "./components/theme";
import { Entity } from "./core/entities/entity";
import { Flower } from "./core/entities/flowers";
import { add, toCartesian } from "./core/r2";

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

export function drawFlower(context: CanvasRenderingContext2D, flower: Flower) {
  if (!flower.next && !flower.parent) {
    context.rect(flower.position.x - 2, flower.position.y - 2, 5, 5);
  } else {
    flower.next.forEach((node) => {
      context.beginPath();
      context.moveTo(flower.position.x, flower.position.y);
      context.lineTo(node.position.x, node.position.y);
      context.stroke();

      drawFlower(context, node);
    });
  }
}
