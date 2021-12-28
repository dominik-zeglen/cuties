import { Cutie, maxHunger } from "../core/entities/cutie";
import { add, sub, toCartesian } from "../core/r2";

export function drawCutie(context: CanvasRenderingContext2D, cutie: Cutie) {
  context.fillStyle = cutie.color;

  const r = 12 - (cutie.hunger / maxHunger) * 9;
  const head = add(cutie.position, toCartesian({ r, angle: cutie.angle }));
  const leftWing = add(
    cutie.position,
    toCartesian({ r, angle: cutie.angle - (Math.PI * 1) / 12 })
  );
  const rightWing = add(
    cutie.position,
    toCartesian({ r, angle: cutie.angle + (Math.PI * 1) / 12 })
  );
  const tail = sub(
    cutie.position,
    toCartesian({ r: r * cutie.tail, angle: cutie.angle })
  );

  context.beginPath();

  context.moveTo(head.x, head.y);
  context.lineTo(leftWing.x, leftWing.y);
  context.lineTo(tail.x, tail.y);
  context.lineTo(rightWing.x, rightWing.y);
  context.lineTo(head.x, head.y);

  context.fill();
}
