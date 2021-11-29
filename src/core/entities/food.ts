import { Entity, InitialEntityInput } from "./entity";

const defaultInitialFoodValue = 1000;

export interface InitialFoodInput extends InitialEntityInput {
  value?: number;
}

export class Food extends Entity {
  value: number;

  constructor(id: number, it: number, initial: InitialFoodInput) {
    super(id, it, initial);
    this.value = initial.value || defaultInitialFoodValue;
  }
}
