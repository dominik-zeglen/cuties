import { Entity, InitialEntityInput } from "./entity";

export const defaultInitialFoodValue = 1000;
const valueLossRate = 0.1;

export interface InitialFoodInput extends InitialEntityInput {
  value?: number;
}

export class Food extends Entity {
  value: number;

  constructor(id: number, it: number, initial: InitialFoodInput) {
    super(id, it, initial);
    this.value = initial.value || defaultInitialFoodValue;
  }

  sim = () => {
    this.value -= valueLossRate;
  };
}
