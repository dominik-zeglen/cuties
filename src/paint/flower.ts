import { drawStaticPellet } from ".";
import { theme } from "../components/theme";
import { Flower, maxHunger } from "../core/entities/flowers";

export function drawFlower(context: CanvasRenderingContext2D, flower: Flower) {
  context.strokeStyle = theme.primary.string();

  drawStaticPellet(context, {
    color: theme.primary.string(),
    pellet: flower,
    size: (1 - flower.hunger / maxHunger) * 2 + 0.5,
  });

  flower.next.forEach((node) => {
    context.beginPath();
    context.moveTo(flower.position.x, flower.position.y);
    context.lineTo(node.position.x, node.position.y);
    context.stroke();

    drawFlower(context, node);
  });
}
