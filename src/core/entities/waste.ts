import { Entity, InitialEntityInput } from "./entity";

export const maxValue = 900;
const valueLossRate = 0.1;

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
}
