import cloneDeep from "lodash/cloneDeep";
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
import { Remains } from "./remains";

export const maxHunger = 2000;
const eggCost = 900;
const initialHunger = maxHunger - eggCost * 0.9;
const eatingRate = 10;
const droppedWasteValue = 250;
export const attackCooldown = 10;
export const rangeRadius = 300;

export function getAngleInput(
  point: PolarPoint | null,
  cutieAngle: number
): number {
  if (point) {
    const angle = cutieAngle - point.angle;
    return Math.atan2(Math.sin(angle), Math.cos(angle)) / Math.PI;
  }

  return 0;
}

export function getInput(cutie: Cutie, simInput: CutieSimInput): CutieInput {
  return {
    hunger: cutie.hunger / maxHunger,
    foundFood: simInput.nearestFood ? 1 : 0,
    angleToFood: getAngleInput(simInput.nearestFood, cutie.angle),
    distanceToFood: simInput.nearestFood
      ? simInput.nearestFood.r / rangeRadius
      : 0,
    foundCutie: simInput.nearestRemains ? 1 : 0,
    angleToCutie: getAngleInput(simInput.nearestCutie, cutie.angle),
    distanceToCutie: simInput.nearestCutie
      ? simInput.nearestCutie.r / rangeRadius
      : 0,
    foundRemains: simInput.nearestRemains ? 1 : 0,
    angleToRemains: getAngleInput(simInput.nearestRemains, cutie.angle),
    distanceToRemains: simInput.nearestRemains
      ? simInput.nearestRemains.r / rangeRadius
      : 0,
  };
}

export interface CutieSimInput {
  iteration: number;
  nearestFood: PolarPoint | null;
  nearestCutie: PolarPoint | null;
  nearestRemains: PolarPoint | null;
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
  lastAttack: number;
  hunger: number;
  thoughts: CutieOutput;
  ancestors: number;
  wasteStored: number;
  hp: number;
  carnivore: number;

  constructor(initial: InitialCutieInput) {
    super(initial);
    this.angle = initial.angle;
    this.hunger = initialHunger;
    this.thoughts = {
      angle: 0,
      speed: 0,
      eat: 0,
      layEgg: 0,
      attack: 0,
    };
    this.ancestors = initial.ancestors;
    this.ai = initial.ai;
    this.wasteStored = 0;
    this.lastEggLaying = 0;
    this.lastAttack = 0;
    this.hp = 100;
    this.carnivore = 0.5;
  }

  die = this.markToDelete;

  sim = (simInput: CutieSimInput | null): void => {
    if (simInput) {
      this.thoughts = think(getInput(this, simInput), this.ai);
    }

    const distance = this.thoughts.speed * (this.thoughts.speed > 0 ? 2 : 0.25);
    this.angle += ((this.thoughts.angle * Math.PI) / 180) * 30;

    this.position = add(
      this.position,
      toCartesian({
        angle: this.angle,
        r: distance,
      })
    );
    const energy =
      (0.25 +
        (1 + Math.abs(this.thoughts.speed)) ** 2 / 4 +
        Math.abs(this.thoughts.angle) / 2) *
      (this.wantsToEat() ? 1 : 0.5) *
      (this.wantsToLayEgg() ? 1 : 0.5) *
      (this.wantsToAttack() ? 2 : 1);

    this.hunger += energy;
    this.wasteStored += energy;

    if (this.hunger > maxHunger) {
      this.die();
    }

    if (this.hp <= 0) {
      this.die();
    }

    if (simInput && simInput.iteration - this.createdAt > 5e3) {
      this.hunger += 1;
    }
  };

  attack = (it: number, cutie: Cutie) => {
    cutie.hp -= 10;
    cutie.lastAttack = it;
  };

  eat = (pellet: Food | Remains) => {
    const rate =
      (pellet instanceof Remains ? this.carnivore : 1 - this.carnivore) *
      eatingRate *
      2;

    this.hunger -= rate;
    if (this.hunger < 0) {
      pellet.value -= rate + this.hunger;
      this.hunger = 0;
    } else {
      pellet.value -= rate;
    }
  };

  wantsToAttack = (): boolean => this.thoughts.attack > 0;

  wantsToEat = (): boolean => true;

  wantsToLayEgg = (): boolean => this.thoughts.layEgg > 0;

  canLayEgg = (): boolean => this.hunger + eggCost * 1.1 < maxHunger;

  canAttack = (it: number): boolean => it - this.lastAttack > attackCooldown;

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

  copy = (): Cutie => {
    const newCutie = new Cutie({
      ai: cloneDeep(this.ai),
      ancestors: this.ancestors,
      angle: this.angle,
      position: cloneDeep(this.position),
    });

    newCutie.createdAt = this.createdAt;
    newCutie.hunger = this.hunger;
    newCutie.id = this.id;
    newCutie.lastEggLaying = this.lastEggLaying;
    newCutie.shouldDelete = this.shouldDelete;
    newCutie.thoughts = cloneDeep(this.thoughts);
    newCutie.wasteStored = this.wasteStored;

    return newCutie;
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
