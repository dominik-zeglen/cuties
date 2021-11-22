import { CutieBrain, CutieInput, getRandomCutieBrain, mutate } from "./brain";
import { Egg } from "./egg";
import { Entity } from "./entity";
import { add, PolarPoint, toEuclidean } from "./r2";
import { getValueFromTree } from "./tree";

export interface CutieSimInput {
  nearestFood: PolarPoint;
}

export class Cutie extends Entity {
  brain: CutieBrain;
  lastEggLaying: number;
  hunger: number;

  constructor(id: number, it: number) {
    super(id, it);
    this.hunger = 0;
    this.lastEggLaying = it;
  }

  sim = (simInput: CutieSimInput): void => {
    const input: CutieInput = {
      angleToFood: simInput.nearestFood.angle,
      hunger: 10,
      distanceToFood: simInput.nearestFood.r,
    };

    const distance = (getValueFromTree(this.brain.speed, input) + 1) / 2;

    this.position = add(
      this.position,
      toEuclidean({
        angle: getValueFromTree(this.brain.angle, input) * 3.141,
        r: distance,
      })
    );
    this.hunger += 1 + distance;

    if (this.hunger > 1000) {
      this.shouldDelete = true;
    }
  };

  shouldLayEgg = (it: number): boolean => {
    return this.hunger < 300 && it - this.lastEggLaying > 250;
  };

  layEgg = (id: number, it: number): Egg => {
    const egg = new Egg(id, it);
    egg.position = { ...this.position };
    egg.brain = Math.random() > 0.4 ? this.brain : mutate(this.brain);
    this.lastEggLaying = it;

    return egg;
  };
}

export function getRandomCutie(id: number, it: number): Cutie {
  const cutie = new Cutie(id, it);

  cutie.brain = getRandomCutieBrain();

  return cutie;
}
