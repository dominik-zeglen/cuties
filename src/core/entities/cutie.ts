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
import { theme } from "../../components/theme";
import settings from "../settings";

const initialHunger = settings.cutie.maxHunger - settings.cutie.eggCost * 0.9;

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
    hunger: cutie.hunger / settings.cutie.maxHunger,
    foundFood: simInput.nearestFood ? 1 : 0,
    angleToFood: getAngleInput(simInput.nearestFood, cutie.angle),
    distanceToFood: simInput.nearestFood
      ? simInput.nearestFood.r / settings.cutie.range
      : 0,
    foundCutie: simInput.nearestRemains ? 1 : 0,
    angleToCutie: getAngleInput(simInput.nearestCutie, cutie.angle),
    distanceToCutie: simInput.nearestCutie
      ? simInput.nearestCutie.r / settings.cutie.range
      : 0,
    foundRemains: simInput.nearestRemains ? 1 : 0,
    angleToRemains: getAngleInput(simInput.nearestRemains, cutie.angle),
    distanceToRemains: simInput.nearestRemains
      ? simInput.nearestRemains.r / settings.cutie.range
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
  color: string;
  shape: number;
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
  color: string;
  shape: number;

  constructor(initial: InitialCutieInput) {
    super(initial);
    this.angle = initial.angle;
    this.hunger = initialHunger;
    this.thoughts = {
      angle: 0,
      eat: 0,
      speed: 0,
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
    this.color = initial.color;
    this.shape = initial.shape;
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
      ((1 + Math.abs(this.thoughts.speed)) ** 1.5 / 15 +
        Math.abs(this.thoughts.angle)) *
      (this.wantsToEat() ? 1 : 0.5) *
      (this.wantsToLayEgg() ? 1 : 0.5) *
      (this.wantsToAttack() ? 2 : 1);

    this.hunger += energy;
    this.wasteStored += energy;

    if (this.hunger > settings.cutie.maxHunger) {
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
    cutie.hp -= 20;
    this.lastAttack = it;
  };

  eat = (pellet: Food | Remains) => {
    const rate =
      (pellet instanceof Remains ? this.carnivore : 1 - this.carnivore) *
      settings.cutie.eatingRate *
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

  wantsToEat = (): boolean => this.thoughts.eat > 0;

  wantsToLayEgg = (): boolean => this.thoughts.layEgg > 0;

  canLayEgg = (): boolean =>
    this.hunger + settings.cutie.eggCost * 1.1 < settings.cutie.maxHunger;

  canAttack = (it: number): boolean =>
    it - this.lastAttack > settings.cutie.attackCooldown;

  layEgg = (it: number): Egg => {
    const egg = new Egg(this);
    this.lastEggLaying = it;
    this.hunger += settings.cutie.eggCost;
    this.wasteStored += settings.cutie.eggCost;

    return egg;
  };

  shouldDumpWaste = (): boolean =>
    this.wasteStored > settings.cutie.droppedWasteValue;

  dumpWaste = (): Waste => {
    this.wasteStored -= settings.cutie.droppedWasteValue;
    return new Waste({
      position: this.position,
      value: settings.cutie.droppedWasteValue,
    });
  };

  copy = (): Cutie => {
    const newCutie = new Cutie({
      ai: cloneDeep(this.ai),
      ancestors: this.ancestors,
      angle: this.angle,
      position: cloneDeep(this.position),
      color: this.color,
      shape: this.shape,
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
    color: theme.entities.cutie.string(),
    shape: 1,
  });

  return cutie;
}
