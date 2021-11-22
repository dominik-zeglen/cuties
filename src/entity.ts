import { Point } from "./r2";

export class Entity {
  id: number;
  position: Point;

  constructor(id: number) {
    this.position = {
      x: 0,
      y: 0,
    };
    this.id = id;
  }
}
