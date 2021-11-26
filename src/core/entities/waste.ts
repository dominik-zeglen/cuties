import { Entity } from "./entity";

export class Waste extends Entity {
  shouldBecomeFood = (it: number): boolean =>
    it - this.createdAt > 1000 && Math.random() < 0.001;
}
