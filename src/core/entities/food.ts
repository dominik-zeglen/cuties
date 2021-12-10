import { Entity, InitialEntityInput } from "./entity";

export const defaultInitialFoodValue = 1000;
export const valueLossRate = 0.1;

export interface InitialFoodInput extends InitialEntityInput {
  value?: number;
}

export class Food extends Entity {
  value: number;

  constructor(initial: InitialFoodInput) {
    super(initial);
    this.value = initial.value || defaultInitialFoodValue;
  }

  sim = () => {
    this.value -= valueLossRate;
  };

  die = this.markToDelete;
}
