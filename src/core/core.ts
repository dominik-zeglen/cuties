import { Cutie, CutieSimInput, getRandomCutie } from "./entities/cutie";
import { Egg } from "./entities/egg";
import { Food } from "./entities/food";
import { getRandomPositionInBounds, len, Point, sub, toPolar } from "./r2";
import { Waste } from "./entities/waste";
import { Entity } from "./entities/entity";

class EntityLoader {
  entities: Entity[];

  _food: Food[] | null;
  _cuties: Cutie[] | null;
  _eggs: Egg[] | null;
  _waste: Waste[] | null;

  constructor() {
    this.entities = [];
  }

  init = (entities: Entity[]) => {
    this.entities = entities;

    this._food = null;
    this._cuties = null;
    this._eggs = null;
    this._waste = null;
  };

  get food(): Food[] {
    if (this._food) {
      return this._food;
    }

    return this.entities.filter((entity) => entity instanceof Food);
  }

  get cuties(): Cutie[] {
    if (this._cuties) {
      return this._cuties;
    }

    return this.entities.filter((entity) => entity instanceof Cutie) as Cutie[];
  }

  get eggs(): Egg[] {
    if (this._eggs) {
      return this._eggs;
    }

    return this.entities.filter((entity) => entity instanceof Egg) as Egg[];
  }

  get waste(): Waste[] {
    if (this._waste) {
      return this._waste;
    }

    return this.entities.filter((entity) => entity instanceof Waste) as Waste[];
  }
}

export class Sim {
  bounds: Point[];
  entities: Entity[];
  iteration: number;
  paused: boolean;
  selected: string | null;

  entityLoader: EntityLoader;
  entityCounter: number;

  constructor(width: number, height: number) {
    this.entities = [];
    this.iteration = 0;
    this.entityCounter = 0;
    this.bounds = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
    ];
    this.entityLoader = new EntityLoader();
    this.selected = null;

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
    if (!this.entityLoader.cuties) {
      return null;
    }

    let oldest = this.entityLoader.cuties[0];
    this.entityLoader.cuties.forEach((cutie) => {
      if (cutie.createdAt < oldest.createdAt) {
        oldest = cutie;
      }
    });

    return oldest;
  };

  shouldSpawnRandomCutie = (): boolean => {
    return this.iteration % 120 === 0 && this.entityLoader.cuties.length < 15;
  };

  shouldSpawnFood = (): boolean => {
    return (
      this.iteration % 30 === 0 &&
      this.entityLoader.food.length < 800 - this.entityLoader.cuties.length * 50
    );
  };

  shouldCleanupOutOfBounds = (): boolean => {
    return this.iteration % 60 === 0;
  };

  getNearestFood = (point: Point): Food =>
    [...this.entityLoader.food].sort((a, b) =>
      len(sub(point, a.position)) > len(sub(point, b.position)) ? 1 : -1
    )[0];

  collectGarbage = () => {
    this.entities = this.entities.filter((entity) => !entity.shouldDelete);
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

  registerEntity = (entity: Entity) => {
    this.entities.push(entity);
    this.entityCounter++;
  };

  next = (): void => {
    if (this.paused) {
      return;
    }

    this.entityLoader.init(this.entities);

    this.entityLoader.cuties.forEach((cutie) => {
      let simInput: CutieSimInput | null = null;
      if (this.entityLoader.food.length && this.iteration % 5 === 0) {
        const nearestFood = this.getNearestFood(cutie.position);
        const nearestFoodPolarPosition = toPolar(
          sub(cutie.position, nearestFood.position)
        );

        if (nearestFoodPolarPosition.r < 10) {
          cutie.hunger = 0;
          nearestFood.shouldDelete = true;
        } else {
          simInput = {
            nearestFood: nearestFoodPolarPosition,
          };
        }
      }

      cutie.sim(simInput);
      if (cutie.shouldLayEgg(this.iteration)) {
        this.registerEntity(cutie.layEgg(this.entityCounter, this.iteration));
      }

      if (cutie.shouldDumpWaste(this.iteration)) {
        const waste = new Waste(this.entityCounter, this.iteration);
        waste.position = getRandomPositionInBounds(this.bounds);

        this.registerEntity(waste);
      }
    });

    this.entityLoader.eggs.forEach((egg) => {
      if (egg.shouldHatch(this.iteration)) {
        this.registerEntity(egg.hatch(this.entityCounter, this.iteration));
      }
    });

    if (this.shouldSpawnRandomCutie()) {
      const cutie = getRandomCutie(this.entityCounter, this.iteration);
      cutie.position = getRandomPositionInBounds(this.bounds);
      this.registerEntity(cutie);
    }

    if (this.shouldSpawnFood()) {
      const food = new Food(this.entityCounter, this.iteration);
      food.position = getRandomPositionInBounds(this.bounds);
      this.registerEntity(food);
    }

    this.entityLoader.waste.forEach((waste) => {
      if (waste.shouldBecomeFood(this.iteration)) {
        waste.shouldDelete = true;
        const food = new Food(this.entityCounter, this.iteration);
        food.position = { ...waste.position };
        this.registerEntity(food);
      }
    });

    this.entityLoader.cuties.forEach((cutie) => {
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
      if (cutie.angle > Math.PI || cutie.angle < Math.PI) {
        cutie.angle = Math.atan2(Math.sin(cutie.angle), Math.cos(cutie.angle));
      }
    });

    this.collectGarbage();
    this.getStats();

    this.iteration++;
  };
}
