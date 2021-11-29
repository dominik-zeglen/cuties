import minBy from "lodash/minBy";
import { Food } from "../entities/food";
import { len, Point, sub } from "../r2";
import { Entity } from "../entities/entity";
import { EntityLoader } from "../entities/loader";
import { shouldSpawnFood, shouldSpawnRandomCutie, spawnRandoms } from "./spawn";
import { cleanupDepletedFood, cleanupOutOfBounds } from "./gc";
import { simCuties, simEggs, simWaste } from "./sim";

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
      selected: undefined,
    };
  }

  pause = () => {
    this.paused = true;
  };

  run = () => {
    this.paused = false;
  };

  shouldSpawnRandomCutie = () =>
    shouldSpawnRandomCutie(this.iteration, this.entityLoader);

  shouldSpawnFood = () => shouldSpawnFood(this.iteration, this.entityLoader);

  shouldCleanupOutOfBounds = (): boolean => this.iteration % 60 === 0;

  getNearestFood = (point: Point): Food =>
    minBy(this.entityLoader.food, (food) => len(sub(food.position, point)));

  collectGarbage = () => {
    cleanupDepletedFood(this.entityLoader.food);
    cleanupOutOfBounds(this.entities, this.bounds);
    this.entities = this.entities.filter((entity) => !entity.shouldDelete);
  };

  getStats = () => {
    if (this.iteration % 120 === 0) {
      window.cuties.stats = {
        itPerSecond: 120000 / (Date.now() - window.cuties.lastReload),
      };
      window.cuties.lastReload = Date.now();
      window.cuties.iteration = this.iteration;
    }
  };

  registerEntity = (entity: Entity) => {
    this.entities.push(entity);
    this.entityCounter++;
  };

  regenerate = () => {
    this.entityLoader.cuties.forEach((cutie) => {
      if (cutie.angle > Math.PI || cutie.angle < Math.PI) {
        cutie.angle = Math.atan2(Math.sin(cutie.angle), Math.cos(cutie.angle));
      }
    });
  };

  next = (): void => {
    if (this.paused) {
      return;
    }

    this.entityLoader.init(this.entities);

    simCuties(this);
    simEggs(this);
    simWaste(this);

    spawnRandoms(this);

    this.regenerate();

    this.collectGarbage();
    this.getStats();

    this.iteration++;
  };
}
