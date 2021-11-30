import { Entity } from "../entities/entity";
import { Food } from "../entities/food";
import { Point } from "../r2";

export function cleanDepletedFood(food: Food[]) {
  food.forEach((foodPellet) => {
    if (foodPellet.value <= 0) {
      foodPellet.shouldDelete = true;
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
