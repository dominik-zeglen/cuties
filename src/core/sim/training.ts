import sum from "lodash/sum";
import { Sim } from ".";
import { CutieAi } from "../ai";
import { Cutie } from "../entities/cutie";
import { Food, valueLossRate } from "../entities/food";
import { cleanDepletedPellets, cleanOutOfBounds } from "./gc";
import { simCuties } from "./sim";

export class TrainingSim extends Sim {
  eggs: number;
  initialFood: number;

  constructor(width: number, height: number, ai: CutieAi) {
    super(width, height);
    this.entities = [];

    for (let x = 0; x < width / 80; x++) {
      for (let y = 0; y < width / 80; y++) {
        this.entities.push(
          new Food({
            position: {
              x: x * 80 + Math.sin(x + y) * 40,
              y: y * 80 + Math.cos(x * y) * 40,
            },
            value: 500,
          })
        );
      }
    }

    this.entities.push(
      new Cutie({
        ai,
        ancestors: 0,
        angle: 0,
        position: {
          x: width / 2,
          y: height / 2,
        },
      })
    );
    this.entityLoader.init(this.entities);
    this.initialFood = sum(
      this.entityLoader.food.map((pellet) => pellet.value)
    );
    this.eggs = 0;
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
    this.entityLoader.init(this.entities);

    simCuties(this);
    this.entityLoader.food.forEach((food) => food.value + valueLossRate);

    this.regenerate();
    this.clean();
    this.getStats();

    this.iteration++;
  };
}
