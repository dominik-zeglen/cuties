import cloneDeep from "lodash/cloneDeep";
import { Drawable } from "../../renderer/drawable";
import { Entity, InitialEntityInput } from "./entity";

export const defaultInitialFoodValue = 1000;
export const valueLossRate = 2e-2;

export interface DrawableFood extends Drawable {
  value: number;
}

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

  copy = (): Food => {
    const newFood = new Food({
      position: cloneDeep(this.position),
      value: this.value,
    });

    newFood.createdAt = this.createdAt;
    newFood.id = this.id;
    newFood.shouldDelete = this.shouldDelete;

    return newFood;
  };

  drawable = (): DrawableFood => ({
    position: this.position,
    value: this.value,
  });
}
