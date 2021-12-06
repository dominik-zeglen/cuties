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
const eggCost = 1200;
const initialHunger = maxHunger - eggCost * 0.9;
const eatingRate = 10;
const droppedWasteValue = 250;

export interface CutieSimInput {
  iteration: number;
  nearestFood: PolarPoint;
}

export interface InitialCutieInput extends InitialEntityInput {
  ai: CutieAi;
  angle: number;
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

  constructor(initial: InitialCutieInput) {
    super(initial);
    this.angle = initial.angle;
    this.hunger = initialHunger;
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

  die = this.markToDelete;

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
    this.angle += ((this.thoughts.angle * Math.PI) / 180) * 60;

    this.position = add(
      this.position,
      toCartesian({
        angle: this.angle,
        r: distance,
      })
    );
    const energy =
      (0.25 + distance ** 2) *
      (this.wantsToEat() ? 1 : 0.5) *
      (this.wantsToLayEgg() ? 1 : 0.5);

    this.hunger += energy;
    this.wasteStored += energy;

    if (this.hunger > maxHunger) {
      this.die();
    }

    if (simInput.iteration - this.createdAt > 3e3 && Math.random() < 1e-2) {
      this.die();
    }
  };

  eat = (food: Food) => {
    this.hunger -= eatingRate;
    if (this.hunger < 0) {
      food.value = -this.hunger;
      this.hunger = 0;
    } else {
      food.value -= eatingRate;
    }
  };

  wantsToEat = (): boolean => this.thoughts.eat > -0.5;

  wantsToLayEgg = (): boolean => this.thoughts.layEgg > -0.5;

  canLayEgg = (): boolean => this.hunger + eggCost * 1.1 < maxHunger;

  layEgg = (it: number): Egg => {
    const egg = new Egg(this);
    this.lastEggLaying = it;
    this.hunger += eggCost;
    this.wasteStored += eggCost;

    return egg;
  };

  shouldDumpWaste = (): boolean => this.wasteStored > droppedWasteValue;

  dumpWaste = (): Waste => {
    this.wasteStored -= droppedWasteValue;
    return new Waste({
      position: this.position,
      value: droppedWasteValue,
    });
  };
}

export function getRandomCutie(bounds: Point[]): Cutie {
  const cutie = new Cutie({
    angle: (Math.random() - 0.5) * Math.PI * 2,
    ancestors: 0,
    ai: getRandomCutieAi(),
    position: getRandomPositionInBounds(bounds),
  });

  return cutie;
}
