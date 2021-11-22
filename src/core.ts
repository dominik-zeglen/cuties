import { Cutie, CutieSimInput, getRandomCutie } from "./cutie";
import { Egg } from "./egg";
import { Food } from "./food";
import { getRandomPositionInBounds, len, Point, sub, toPolar } from "./r2";
import { degree } from "./tree";

export class Sim {
  bounds: Point[];
  cuties: Cutie[];
  food: Food[];
  eggs: Egg[];
  iteration: number;

  entityCounter: number;

  constructor(width: number, height: number) {
    this.cuties = [];
    this.food = [];
    this.eggs = [];
    this.iteration = 0;
    this.entityCounter = 0;
    this.bounds = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
    ];
  }

  shouldSpawnRandomCutie = (): boolean => {
    return this.iteration % 120 === 0;
  };

  shouldSpawnFood = (): boolean => {
    return this.iteration % 40 === 0 && this.food.length < 60;
  };

  shouldCleanupOutOfBounds = (): boolean => {
    return this.iteration % 600 === 0;
  };

  getNearestFood = (point: Point): Food =>
    [...this.food].sort((a, b) =>
      len(sub(point, a.position)) > len(sub(point, b.position)) ? 1 : -1
    )[0];

  next = (): void => {
    this.cuties.forEach((cutie) => {
      const simInput: CutieSimInput = {
        nearestFood: { angle: 0, r: 0 },
      };
      if (this.food.length) {
        const nearestFood = this.getNearestFood(cutie.position);
        const nearestFoodPolarPosition = toPolar(
          sub(cutie.position, nearestFood.position)
        );

        if (nearestFoodPolarPosition.r < 10) {
          cutie.hunger = 0;
          nearestFood.shouldDelete = true;
        } else {
          simInput.nearestFood = nearestFoodPolarPosition;
        }
      }

      cutie.sim(simInput);
      if (cutie.shouldLayEgg(this.iteration)) {
        this.eggs = this.eggs.concat(
          cutie.layEgg(this.entityCounter, this.iteration)
        );
        this.entityCounter++;
      }
    });

    this.eggs.forEach((currentEgg) => {
      if (currentEgg.shouldHatch(this.iteration)) {
        this.cuties = this.cuties.concat(
          currentEgg.hatch(this.entityCounter, this.iteration)
        );
        this.entityCounter++;
      }
    });

    if (this.shouldSpawnRandomCutie()) {
      const cutie = getRandomCutie(this.entityCounter, this.iteration);
      cutie.position = getRandomPositionInBounds(this.bounds);
      this.cuties = this.cuties.concat(cutie);
      this.entityCounter++;
    }

    if (this.shouldSpawnFood()) {
      const food = new Food(this.entityCounter, this.iteration);
      food.position = getRandomPositionInBounds(this.bounds);

      this.food = this.food.concat(food);
      this.entityCounter++;
    }

    if (this.shouldCleanupOutOfBounds()) {
      this.cuties.forEach((cutie) => {
        const isInBounds =
          cutie.position.x < this.bounds[1].x &&
          cutie.position.x > this.bounds[0].x &&
          cutie.position.y < this.bounds[1].y &&
          cutie.position.y > this.bounds[0].y;
        if (!isInBounds) {
          cutie.shouldDelete = true;
        }
      });
    }

    if (this.iteration % 120 === 0) {
      window.cuties = {
        stats: {
          degree: {
            highest: Math.max(
              ...this.cuties.map((cutie) => degree(cutie.brain.angle))
            ),
          },
        },
      };
    }

    this.cuties = this.cuties.filter((cutie) => !cutie.shouldDelete);
    this.eggs = this.eggs.filter((egg) => !egg.shouldDelete);
    this.food = this.food.filter((food) => !food.shouldDelete);

    this.iteration++;
  };
}
