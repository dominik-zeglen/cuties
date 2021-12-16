import { Sim } from ".";
import { CutieAi } from "../ai";
import { Cutie, maxHunger } from "../entities/cutie";
import { Food } from "../entities/food";
import { add, sub, toCartesian, len } from "../r2";
import { cleanDepletedPellets, cleanOutOfBounds } from "./gc";
import { simCuties } from "./sim";
import foods from "../../mapAssets/training.json";

const size = 400;

export type Score = Record<"distance" | "eaten" | "eggs", number>;

export class TrainingSim extends Sim {
  eggs: number;
  newPelletCooldown: number;
  pelletsEaten: number;
  closestInRound: number;

  constructor(ai: CutieAi) {
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
        position: foods[0],
        value: 500,
      })
    );

    this.entityLoader.init(this.entities);
    this.eggs = 0;
    this.pelletsEaten = 0;
    this.newPelletCooldown = 0;
    this.closestInRound = size * 1.41;
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
    if (this.entityLoader.food.length === 0) {
      if (this.newPelletCooldown === 0) {
        this.pelletsEaten++;
        this.newPelletCooldown = 15;
        this.closestInRound = size * 1.41;
      } else {
        this.newPelletCooldown--;
      }

      if (this.newPelletCooldown === 0) {
        this.registerEntity(
          new Food({
            position: foods[this.pelletsEaten],
            value: 500,
          })
        );
      }
    }

    this.entityLoader.init(this.entities);

    simCuties(this);
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

  getScore = (): Score => {
    const scoreForDistance = 1 - this.closestInRound / (size * 1.41);
    return {
      distance: scoreForDistance,
      eaten: this.pelletsEaten * 500,
      eggs: this.eggs ** 2 / 10,
    };
  };
}
