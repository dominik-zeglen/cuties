import { drawIndicator } from "./indicator";
import { Sim } from "../../core/sim";

export interface PaintOpts {
  width: number;
  height: number;
  sim: Sim;
}

export function paint(
  context: CanvasRenderingContext2D,
  { width, height }: PaintOpts
) {
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
