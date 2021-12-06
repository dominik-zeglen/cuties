import { theme } from "../components/theme";
import { Cutie } from "../core/entities/cutie";

export function drawCutie(context: CanvasRenderingContext2D, cutie: Cutie) {
  context.strokeStyle = theme.secondary.string();

  context.beginPath();
  context.rect(cutie.position.x - 2, cutie.position.y - 2, 5, 5);
  context.stroke();
}
