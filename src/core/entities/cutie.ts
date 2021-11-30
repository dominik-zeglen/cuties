import {
  CutieAi,
  CutieInput,
  CutieOutput,
  getRandomCutieAi,
  think,
} from "../ai";
import { Egg } from "./egg";
import { Entity, InitialEntityInput } from "./entity";
import {
  add,
  getRandomPositionInBounds,
  Point,
  PolarPoint,
  toCartesian,
} from "../r2";
import { Food } from "./food";
import { Waste } from "./waste";

const maxHunger = 2000;
const initialHunger = maxHunger / 4;
const eggCost = 1000;

export interface CutieSimInput {
  nearestFood: PolarPoint;
}

export interface InitialCutieInput extends InitialEntityInput {
  ai: CutieAi;
  ancestors: number;
}

export class Cutie extends Entity {
  angle: number;
  ai: CutieAi;
  lastEggLaying: number;
  hunger: number;
  thoughts: CutieOutput;
  ancestors: number;
  wasteStored: number;

  constructor(id: number, it: number, initial: InitialCutieInput) {
    super(id, it, initial);
    this.angle = 0;
    this.hunger = initialHunger;
    this.lastEggLaying = it;
    this.thoughts = {
      angle: 0,
      speed: 0,
      eat: 0,
      layEgg: 0,
    };
    this.ancestors = initial.ancestors;
    this.ai = initial.ai;
    this.wasteStored = 0;
  }

  sim = (simInput: CutieSimInput | null): void => {
    if (simInput) {
      const input: CutieInput = {
        angle: this.angle / Math.PI,
        angleToFood: simInput.nearestFood.angle / Math.PI,
        hunger: this.hunger / maxHunger,
        distanceToFood: simInput.nearestFood.r / 200,
      };

      this.thoughts = think(input, this.ai);
    }

    const distance = this.thoughts.speed * 2;
    this.angle += this.thoughts.angle * 4;

    this.position = add(
      this.position,
      toCartesian({
        angle: this.angle,
        r: distance,
      })
    );
    const energy =
      (0.25 + distance ** 2) *
      (this.wantsToEat() ? 2 : 1) *
      (this.wantsToLayEgg() ? 1.5 : 1);

    this.hunger += energy;
    this.wasteStored += energy;

    if (this.hunger > maxHunger) {
      this.shouldDelete = true;
    }
  };

  eat = (food: Food) => {
    this.hunger -= food.value;
    if (this.hunger < 0) {
      food.value = -this.hunger;
      this.hunger = 0;
    } else {
      food.value = 0;
    }
  };

  wantsToEat = (): boolean => this.thoughts.eat > 0;

  wantsToLayEgg = (): boolean => this.thoughts.layEgg > 0;

  canLayEgg = (it: number): boolean =>
    this.hunger < maxHunger - eggCost &&
    it - this.lastEggLaying > initialHunger;

  layEgg = (id: number, it: number): Egg => {
    const egg = new Egg(id, it, this);
    this.lastEggLaying = it;
    this.hunger += eggCost;
    this.wasteStored += eggCost;

    return egg;
  };

  shouldDumpWaste = (): boolean => this.wasteStored > 1000;

  dumpWaste = (id: number, it: number): Waste => {
    this.wasteStored -= 1000;
    return new Waste(id, it, {
      position: this.position,
    });
  };
}

export function getRandomCutie(id: number, it: number, bounds: Point[]): Cutie {
  const cutie = new Cutie(id, it, {
    ancestors: 0,
    ai: getRandomCutieAi(),
    position: getRandomPositionInBounds(bounds),
  });

  return cutie;
}
