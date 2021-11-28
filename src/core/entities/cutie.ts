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
  toEuclidean,
} from "../r2";

export interface CutieSimInput {
  nearestFood: PolarPoint;
}

function limitOutput(value: number): number {
  return value > 1 ? 1 : value < -1 ? -1 : value;
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

  constructor(id: number, it: number, initial: InitialCutieInput) {
    super(id, it, initial);
    this.angle = 0;
    this.hunger = 500;
    this.lastEggLaying = it;
    this.thoughts = {
      angle: 0,
      speed: 0,
    };
    this.ancestors = initial.ancestors;
    this.ai = initial.ai;
  }

  sim = (simInput: CutieSimInput | null): void => {
    if (simInput) {
      const input: CutieInput = {
        angle: this.angle / Math.PI,
        angleToFood: simInput.nearestFood.angle / Math.PI,
        hunger: this.hunger / 2000,
        distanceToFood: simInput.nearestFood.r / 200,
      };

      this.thoughts = think(input, this.ai);
    }

    const distance = limitOutput(this.thoughts.speed) * 2;
    this.angle += limitOutput(this.thoughts.angle) * 4;

    this.position = add(
      this.position,
      toEuclidean({
        angle: this.angle,
        r: distance,
      })
    );
    this.hunger += 0.75 + distance ** 2;

    if (this.hunger > 2000) {
      this.shouldDelete = true;
    }
  };

  shouldLayEgg = (it: number): boolean => {
    return this.hunger < 400 && it - this.lastEggLaying > 500;
  };

  layEgg = (id: number, it: number): Egg => {
    const egg = new Egg(id, it, this);
    this.lastEggLaying = it;
    this.hunger += 800;

    return egg;
  };

  shouldDumpWaste = (it: number): boolean => {
    return (it - this.createdAt) % 1000 === 0;
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
