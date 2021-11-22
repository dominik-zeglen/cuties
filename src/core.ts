import { Cutie, CutieSimInput, getRandomCutie } from "./cutie";
import { Food } from "./food";
import { len, Point, sub, toPolar } from "./r2";

export class Sim {
  bounds: Point[];
  cuties: Cutie[];
  food: Food[];
  iteration: number;

  entityCounter: number;

  constructor(width: number, height: number) {
    this.cuties = [];
    this.food = [];
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
    return this.iteration % 40 === 0 && this.food.length < 20;
  };

  shouldCleanup = (): boolean => {
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
          this.food = this.food.filter((food) => food.id !== nearestFood.id);
        } else {
          simInput.nearestFood = nearestFoodPolarPosition;
        }
      }

      cutie.sim(simInput);
    });

    if (this.shouldSpawnRandomCutie()) {
      const cutie = getRandomCutie(this.entityCounter);
      this.cuties = this.cuties.concat(cutie);
      this.entityCounter++;
    }

    if (this.shouldSpawnFood()) {
      const food = new Food(this.entityCounter);
      food.position.x = Math.random() * this.bounds[1].x * 2 + this.bounds[0].x;
      food.position.y = Math.random() * this.bounds[1].y * 2 + this.bounds[0].y;
      this.food = this.food.concat(food);
      this.entityCounter++;
    }

    if (this.shouldCleanup()) {
      this.cuties = this.cuties.filter(
        (cutie) =>
          cutie.position.x < this.bounds[1].x &&
          cutie.position.x > this.bounds[0].x &&
          cutie.position.y < this.bounds[1].y &&
          cutie.position.y > this.bounds[0].y &&
          cutie.hunger < 1000
      );
    }

    this.iteration++;
  };
}
