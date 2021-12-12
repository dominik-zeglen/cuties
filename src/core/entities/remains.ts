import cloneDeep from "lodash/cloneDeep";
import { Entity, InitialEntityInput } from "./entity";

export const valueLossRate = 0.1;

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
}
