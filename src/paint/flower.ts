import { theme } from "../components/theme";
import { Flower } from "../core/entities/flowers";

export function drawFlower(context: CanvasRenderingContext2D, flower: Flower) {
  context.strokeStyle = theme.primary.string();

  context.beginPath();
  context.rect(flower.position.x - 2, flower.position.y - 2, 5, 5);
  context.stroke();

  flower.next.forEach((node) => {
    context.beginPath();
    context.moveTo(flower.position.x, flower.position.y);
    context.lineTo(node.position.x, node.position.y);
    context.stroke();

    drawFlower(context, node);
  });
}
