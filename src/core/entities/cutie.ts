import {
  CutieAi,
  CutieInput,
  CutieOutput,
  getRandomCutieAi,
  mutate,
  think,
} from "../ai";
import { Egg } from "./egg";
import { Entity } from "./entity";
import { add, PolarPoint, toEuclidean } from "../r2";

export interface CutieSimInput {
  nearestFood: PolarPoint;
}

function limitOutput(value: number): number {
  return value > 1 ? 1 : value < -1 ? -1 : value;
}

export class Cutie extends Entity {
  angle: number;
  brain: CutieAi;
  lastEggLaying: number;
  hunger: number;
  thoughts: CutieOutput;

  constructor(id: number, it: number) {
    super(id, it);
    this.angle = 0;
    this.hunger = 500;
    this.lastEggLaying = it;
    this.thoughts = {
      angle: 0,
      speed: 0,
    };
  }

  sim = (simInput: CutieSimInput | null): void => {
    if (simInput) {
      const input: CutieInput = {
        angle: this.angle,
        angleToFood: simInput.nearestFood.angle,
        hunger: this.hunger,
        distanceToFood: simInput.nearestFood.r,
      };

      this.thoughts = think(input, this.brain);
    }

    const distance = limitOutput(this.thoughts.speed) * 2;
    this.angle += limitOutput(this.thoughts.angle) * 2;

    this.position = add(
      this.position,
      toEuclidean({
        angle: this.angle,
        r: distance,
      })
    );
    this.hunger += (1 + distance ** 2) / 2;

    if (this.hunger > 2000) {
      this.shouldDelete = true;
    }
  };

  shouldLayEgg = (it: number): boolean => {
    return this.hunger < 250 && it - this.lastEggLaying > 500;
  };

  layEgg = (id: number, it: number): Egg => {
    const egg = new Egg(id, it);
    egg.position = { ...this.position };
    egg.brain = Math.random() > 0.25 ? this.brain : mutate(this.brain);
    this.lastEggLaying = it;

    return egg;
  };
}

export function getRandomCutie(id: number, it: number): Cutie {
  const cutie = new Cutie(id, it);

  cutie.brain = getRandomCutieAi();

  return cutie;
}
