import cloneDeep from "lodash/cloneDeep";
import { Drawable } from "../../renderer/drawable";
import { Entity, InitialEntityInput } from "./entity";

export const valueLossRate = 2e-2;

export interface DrawableRemains extends Drawable {
  value: number;
}

export interface InitialRemainsInput extends InitialEntityInput {
  value: number;
}

export class Remains extends Entity {
  value: number;

  constructor(initial: InitialRemainsInput) {
    super(initial);
    this.value = initial.value;
  }

  sim = () => {
    this.value -= valueLossRate;
  };

  die = this.markToDelete;

  copy = (): Remains => {
    const newRemains = new Remains({
      position: cloneDeep(this.position),
      value: this.value,
    });

    newRemains.createdAt = this.createdAt;
    newRemains.id = this.id;
    newRemains.shouldDelete = this.shouldDelete;

    return newRemains;
  };

  drawable = (): DrawableRemains => ({
    position: this.position,
    value: this.value,
  });
}
