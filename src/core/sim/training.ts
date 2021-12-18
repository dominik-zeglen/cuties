import { sum } from "simple-statistics";
import { Sim } from ".";
import { CutieAi } from "../ai";
import { Cutie, maxHunger } from "../entities/cutie";
import { Food } from "../entities/food";
import { add, sub, toCartesian, len } from "../r2";
import { cleanDepletedPellets, cleanOutOfBounds } from "./gc";
import { simCutie, simCuties } from "./sim";
import foods from "../../mapAssets/training.json";

const size = 400;

export type Score = Record<
  "currentFood" | "distance" | "eaten" | "eggs",
  number
> & {
  speed: number[];
};

export class TrainingSim extends Sim {
  eggs: number;
  newPelletCooldown: number;
  pelletsEaten: number[];
  closestInRound: number;
  traveled: number;
  foodOffset: number;
  // eslint-disable-next-line no-unused-vars
  simCutie: (cutie: Cutie, sim: Sim) => void;

  constructor(ai: CutieAi, foodOffset: number) {
    super(size, size);
    this.clear();

    this.registerEntity(
      new Cutie({
        ai,
        ancestors: 0,
        angle: 0,
        position: {
          x: size / 2,
          y: size / 2,
        },
      })
    );
    (this.entities.at(-1) as Cutie).hunger = 0;
    this.registerEntity(
      new Food({
        position: foods[foodOffset],
        value: 500,
      })
    );

    this.entityLoader.init(this.entities);
    this.eggs = 0;
    this.pelletsEaten = [];
    this.newPelletCooldown = 0;
    this.closestInRound = size * 1.41;
    this.foodOffset = foodOffset;
    this.simCutie = simCutie;
  }

  clean = (): void => {
    cleanDepletedPellets(this.entityLoader.food);
    cleanOutOfBounds(this.entityLoader.cuties, this.bounds);

    this.entityLoader.eggs.forEach((egg) => {
      egg.markToDelete();
      this.eggs++;
    });
    this.entityLoader.waste.forEach((waste) => {
      waste.markToDelete();
    });

    this.entities = this.entities.filter((entity) => !entity.shouldDelete);
  };

  next = (): void => {
    if (this.paused) {
      return;
    }

    if (this.entityLoader.food.length === 0) {
      if (this.newPelletCooldown === 0) {
        this.pelletsEaten.push(this.iteration);
        this.newPelletCooldown = 15;
        this.closestInRound = size * 1.41;
      } else {
        this.newPelletCooldown--;
      }

      if (this.newPelletCooldown === 0) {
        this.registerEntity(
          new Food({
            position: foods[this.foodOffset + this.pelletsEaten.length],
            value: 500,
          })
        );
      }
    }

    this.entityLoader.init(this.entities);

    this.simCutie(this.getById(0), this);
    const distance = this.getDistanceToFood();
    if (distance < this.closestInRound) {
      this.closestInRound = distance;
    }

    this.regenerate();
    this.clean();
    this.getStats();

    this.iteration++;
  };

  getDistanceToFood = (): number => {
    if (this.entityLoader.cuties.length && this.entityLoader.food.length) {
      return len(
        sub(
          this.entityLoader.cuties[0].position,
          this.entityLoader.food[0].position
        )
      );
    }

    return size * 1.41;
  };

  getScore = (): Score => ({
    currentFood: this.entityLoader.food[0]?.value || 0,
    distance: this.closestInRound,
    eaten: this.pelletsEaten.length,
    eggs: this.eggs,
    speed: this.pelletsEaten,
  });
}
