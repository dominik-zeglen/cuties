import { Sim } from ".";
import { CutieAi } from "../ai";
import { Cutie } from "../entities/cutie";
import { sub, len } from "../r2";
import { Food } from "../entities/food";
import { cleanDepletedPellets, cleanOutOfBounds } from "./gc";
import { simCutie } from "./sim";
import foods from "../../mapAssets/training.json";

const size = 400;

export type Score = Record<
  "currentFood" | "distance" | "eaten" | "eggs",
  number
> & {
  speed: number[];
};

export const pelletValue = 100;

export class TrainingSim extends Sim {
  eggs: number;
  newPelletCooldown: number;
  pelletsEaten: number[];
  traveled: number;
  foodOffset: number;
  enableThinking: boolean;

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
    (this.getById(0) as Cutie).hunger = 500;

    this.foodOffset = foodOffset % foods.length;
    this.registerEntity(
      new Food({
        position: foods[this.foodOffset],
        value: pelletValue,
      })
    );

    this.entityLoader.init(this.entities);
    this.eggs = 0;
    this.pelletsEaten = [];
    this.newPelletCooldown = 0;
    this.enableThinking = true;
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
      } else {
        this.newPelletCooldown--;
      }

      if (this.newPelletCooldown === 0) {
        this.registerEntity(
          new Food({
            position: foods[this.foodOffset + this.pelletsEaten.length],
            value: pelletValue,
          })
        );
      }
    }

    this.entityLoader.init(this.entities);

    const cutie: Cutie = this.getById(0);
    if (cutie) {
      simCutie(cutie, this, this.enableThinking);
    }

    this.regenerate();
    this.clean();
    this.getStats();

    this.iteration++;
  };

  getDistanceToFood = (): number => {
    const cutie: Cutie = this.getById(0);
    if (cutie && this.entityLoader.food.length) {
      return len(sub(cutie.position, this.entityLoader.food[0].position));
    }

    return size * 1.41;
  };

  getScore = (): Score => ({
    currentFood: this.entityLoader.food[0]?.value || 0,
    distance: this.getDistanceToFood(),
    eaten: this.pelletsEaten.length,
    eggs: this.eggs,
    speed: this.pelletsEaten,
  });

  copy = (): TrainingSim => {
    const newSim = new TrainingSim(undefined, this.foodOffset);

    newSim.eggs = this.eggs;
    newSim.newPelletCooldown = this.newPelletCooldown;
    newSim.pelletsEaten = [...this.pelletsEaten];
    newSim.traveled = this.traveled;
    newSim.foodOffset = this.foodOffset;
    newSim.entityCounter = this.entityCounter;

    newSim.entities = this.entities.map((entity) => entity.copy());

    return newSim;
  };
}
