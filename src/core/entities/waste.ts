import { Entity, InitialEntityInput } from "./entity";

export const maxValue = 900;
const valueLossRate = 0.1;

export interface InitialWasteInput extends InitialEntityInput {
  value?: number;
}

export class Waste extends Entity {
  value: number;

  constructor(id: number, it: number, initial: InitialWasteInput) {
    super(id, it, initial);
    this.value = initial.value ?? maxValue;
  }

  sim = () => {
    this.value -= valueLossRate;
  };
}
