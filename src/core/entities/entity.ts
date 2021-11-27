import { Point } from "../r2";

export interface InitialEntityInput {
  position: Point;
}

export class Entity {
  id: number;
  createdAt: number;
  position: Point;
  shouldDelete: boolean;

  constructor(id: number, it: number, initial: InitialEntityInput) {
    this.position = { ...initial.position };
    this.id = id;
    this.createdAt = it;
    this.shouldDelete = false;
  }
}
