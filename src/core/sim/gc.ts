import { Entity } from "../entities/entity";
import { Food } from "../entities/food";
import { Waste } from "../entities/waste";
import { Point } from "../r2";

export function cleanDepletedPellets(pellets: Array<Food | Waste>) {
  pellets.forEach((pellet) => {
    if (pellet.value <= 0) {
      pellet.shouldDelete = true;
    }
  });
}

export function cleanOutOfBounds(entities: Entity[], bounds: Point[]) {
  entities.forEach((ent) => {
    if (ent.position.x > bounds[1].x) {
      ent.shouldDelete = true;
    }
    if (ent.position.y > bounds[1].y) {
      ent.shouldDelete = true;
    }

    if (ent.position.x < bounds[0].x) {
      ent.shouldDelete = true;
    }
    if (ent.position.y < bounds[0].y) {
      ent.shouldDelete = true;
    }
  });
}
