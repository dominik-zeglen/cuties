import { Cutie } from "../../core/entities/cutie";
import { add, rotate, sub, toCartesian } from "../../core/r2";
import settings from "../../core/settings";

export type DrawCutieInput = Pick<
  Cutie,
  "angle" | "position" | "color" | "shape" | "hunger"
>;

export function drawCutie(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  cutie: DrawCutieInput,
  scale: number
) {
  context.fillStyle = cutie.color;

  const r = (16 - (cutie.hunger / settings.cutie.maxHunger) * 10) * scale;
  const head = add(
    cutie.position,
    toCartesian({ r: (r * cutie.shape) / 4, angle: cutie.angle })
  );
  const leftWing = add(
    cutie.position,
    rotate(
      {
        x: 0,
        y: r / cutie.shape / 6,
      },
      cutie.angle
    )
  );
  const rightWing = add(
    cutie.position,
    rotate(
      {
        x: 0,
        y: -r / cutie.shape / 6,
      },
      cutie.angle
    )
  );
  const tail = sub(
    cutie.position,
    toCartesian({ r: r * cutie.shape, angle: cutie.angle })
  );

  context.beginPath();

  context.moveTo(head.x, head.y);
  context.lineTo(leftWing.x, leftWing.y);
  context.lineTo(tail.x, tail.y);
  context.lineTo(rightWing.x, rightWing.y);
  context.lineTo(head.x, head.y);

  context.fill();
}
