import { Cutie, CutieSimInput, getRandomCutie } from "./entities/cutie";
import { Egg } from "./entities/egg";
import { Food } from "./entities/food";
import { getRandomPositionInBounds, len, Point, sub, toPolar } from "./r2";
import { Waste } from "./entities/waste";

export class Sim {
  bounds: Point[];
  cuties: Cutie[];
  food: Food[];
  waste: Waste[];
  eggs: Egg[];
  iteration: number;
  paused: boolean;

  entityCounter: number;

  constructor(width: number, height: number) {
    this.cuties = [];
    this.food = [];
    this.eggs = [];
    this.waste = [];
    this.iteration = 0;
    this.entityCounter = 0;
    this.bounds = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
    ];

    window.cuties = {
      get: {
        oldest: this.getOldest,
      },
      sim: {
        current: this,
        pause: this.pause,
        run: this.run,
      },
      lastReload: Date.now(),
      started: Date.now(),
      iteration: 0,
      stats: {
        itPerSecond: 0,
      },
    };
  }

  pause = () => {
    this.paused = true;
  };
  run = () => {
    this.paused = false;
  };

  getOldest = (): Cutie | null => {
    if (!this.cuties) {
      return null;
    }

    let oldest = this.cuties[0];
    this.cuties.forEach((cutie) => {
      if (cutie.createdAt < oldest.createdAt) {
        oldest = cutie;
      }
    });

    return oldest;
  };

  shouldSpawnRandomCutie = (): boolean => {
    return this.iteration % 600 === 0 && this.cuties.length < 40;
  };

  shouldSpawnFood = (): boolean => {
    return (
      this.iteration % 40 === 0 &&
      this.food.length < 800 - this.cuties.length * 50
    );
  };

  shouldCleanupOutOfBounds = (): boolean => {
    return this.iteration % 60 === 0;
  };

  getNearestFood = (point: Point): Food =>
    [...this.food].sort((a, b) =>
      len(sub(point, a.position)) > len(sub(point, b.position)) ? 1 : -1
    )[0];

  collectGarbage = () => {
    this.cuties = this.cuties.filter((cutie) => !cutie.shouldDelete);
    this.eggs = this.eggs.filter((egg) => !egg.shouldDelete);
    this.food = this.food.filter((food) => !food.shouldDelete);
  };

  getStats = () => {
    if (this.iteration % 120 === 0) {
      (window.cuties.lastReload = Date.now()),
        (window.cuties.stats = {
          itPerSecond: 120000 / (Date.now() - window.cuties.lastReload),
        });
      window.cuties.iteration = this.iteration;
    }
  };

  next = (): void => {
    if (this.paused) {
      return;
    }

    this.cuties.forEach((cutie) => {
      const simInput: CutieSimInput = {
        nearestFood: { angle: 0, r: 0 },
      };
      if (this.food.length && this.iteration % 5 === 0) {
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

      if (cutie.shouldDumpWaste(this.iteration)) {
        const waste = new Waste(this.entityCounter, this.iteration);
        waste.position = getRandomPositionInBounds(this.bounds);

        this.waste = this.waste.concat(waste);
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

    this.cuties.forEach((cutie) => {
      if (cutie.position.x > this.bounds[1].x) {
        cutie.position.x = this.bounds[0].x;
      }
      if (cutie.position.y > this.bounds[1].y) {
        cutie.position.y = this.bounds[0].y;
      }

      if (cutie.position.x < this.bounds[0].x) {
        cutie.position.x = this.bounds[1].x;
      }
      if (cutie.position.y < this.bounds[0].y) {
        cutie.position.y = this.bounds[1].y;
      }
    });

    this.collectGarbage();
    this.getStats();

    this.iteration++;
  };
}
