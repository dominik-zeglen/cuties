import {
  drawCutie,
  drawFlower,
  drawIndicator,
  drawPellet,
  drawStaticPellet,
} from ".";
import { theme } from "../components/theme";
import { maxHunger } from "../core/entities/cutie";
import { defaultInitialFoodValue } from "../core/entities/food";
import { Sim } from "../core/sim";
import { maxValue } from "../core/entities/waste";

export interface PaintOpts {
  width: number;
  height: number;
  sim: Sim;
}

export function paint(
  context: CanvasRenderingContext2D,
  { sim, width, height }: PaintOpts
) {
  context.clearRect(0, 0, sim.bounds[1].x, sim.bounds[1].y);

  sim.entityLoader.food.forEach((food) =>
    drawPellet(context, {
      color: theme.primary.string(),
      maxValue: defaultInitialFoodValue,
      pellet: food,
    })
  );

  sim.entityLoader.eggs.forEach((egg) =>
    drawStaticPellet(context, {
      color: theme.entities.egg.string(),
      pellet: egg,
      size: 3,
    })
  );

  sim.entityLoader.waste.forEach((waste) =>
    drawPellet(context, {
      color: theme.entities.dump.string(),
      pellet: waste,
      maxValue,
    })
  );

  sim.entityLoader.remains.forEach((remains) =>
    drawPellet(context, {
      color: theme.entities.remains.string(),
      pellet: remains,
      maxValue: maxHunger / 2,
    })
  );

  sim.entityLoader.flowerRoots.forEach((flower) => drawFlower(context, flower));

  sim.entityLoader.cuties.forEach((cutie) => drawCutie(context, cutie));

  if (window.cuties.selected) {
    if (window.cuties.selected.shouldDelete) {
      window.cuties.selected = undefined;
    } else {
      drawIndicator(context, {
        entity: window.cuties.selected,
        width,
        height,
      });
    }
  }
}
