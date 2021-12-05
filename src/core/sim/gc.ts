import { Entity } from "../entities/entity";
import { Food } from "../entities/food";
import { Waste } from "../entities/waste";
import { Point } from "../r2";

export function cleanDepletedPellets(pellets: Array<Food | Waste>) {
  pellets.forEach((pellet) => {
    if (pellet.value <= 0) {
      pellet.die();
    }
  });
}

export function cleanOutOfBounds(entities: Entity[], bounds: Point[]) {
  entities.forEach((ent) => {
    if (ent.position.x > bounds[1].x) {
      ent.die();
    }
    if (ent.position.y > bounds[1].y) {
      ent.die();
    }

    if (ent.position.x < bounds[0].x) {
      ent.die();
    }
    if (ent.position.y < bounds[0].y) {
      ent.die();
    }
  });
}
