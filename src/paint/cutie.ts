import { theme } from "../components/theme";
import { Cutie, maxHunger } from "../core/entities/cutie";
import { add, toCartesian } from "../core/r2";

export function drawCutie(context: CanvasRenderingContext2D, cutie: Cutie) {
  context.strokeStyle = theme.secondary.string();

  const r = 12 - (cutie.hunger / maxHunger) * 9;
  const head = add(cutie.position, toCartesian({ r, angle: cutie.angle }));
  const leftWing = add(
    cutie.position,
    toCartesian({ r, angle: cutie.angle - (Math.PI * 11) / 12 })
  );
  const rightWing = add(
    cutie.position,
    toCartesian({ r, angle: cutie.angle + (Math.PI * 11) / 12 })
  );

  context.beginPath();

  context.moveTo(cutie.position.x, cutie.position.y);
  context.lineTo(leftWing.x, leftWing.y);
  context.lineTo(head.x, head.y);
  context.lineTo(rightWing.x, rightWing.y);
  context.lineTo(cutie.position.x, cutie.position.y);

  context.stroke();
}
