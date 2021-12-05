import { Rect } from "@timohausmann/quadtree-js";
import { Point } from "../r2";

export interface InitialEntityInput {
  position: Point;
}

export class Entity implements Rect {
  id: number;
  createdAt: number;
  position: Point;
  size: Point;
  shouldDelete: boolean;

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get width(): number {
    return this.size.x;
  }

  get height(): number {
    return this.size.y;
  }

  constructor(initial: InitialEntityInput) {
    this.position = { ...initial.position };
    this.shouldDelete = false;
    this.size = { x: 1, y: 1 };
  }

  markToDelete = () => {
    this.shouldDelete = true;
  };

  // eslint-disable-next-line class-methods-use-this
  die(): void {}
}
