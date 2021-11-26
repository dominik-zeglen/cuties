import { Point } from "../r2";

export class Entity {
  id: number;
  createdAt: number;
  position: Point;
  shouldDelete: boolean;

  constructor(id: number, it: number) {
    this.position = {
      x: 0,
      y: 0,
    };
    this.id = id;
    this.createdAt = it;
    this.shouldDelete = false;
  }
}
