import cloneDeep from "lodash/cloneDeep";
import { Entity, InitialEntityInput } from "./entity";

export const maxValue = 400;
const valueLossRate = 2e-2;

export interface InitialWasteInput extends InitialEntityInput {
  value?: number;
}

export class Waste extends Entity {
  value: number;

  constructor(initial: InitialWasteInput) {
    super(initial);
    this.value = initial.value ?? maxValue;
  }

  sim = () => {
    this.value -= valueLossRate;
  };

  die = this.markToDelete;

  copy = (): Waste => {
    const newWaste = new Waste({
      position: cloneDeep(this.position),
      value: this.value,
    });

    newWaste.createdAt = this.createdAt;
    newWaste.id = this.id;
    newWaste.shouldDelete = this.shouldDelete;

    return newWaste;
  };
}
