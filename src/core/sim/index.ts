import minBy from "lodash/minBy";
import Quadtree from "@timohausmann/quadtree-js";
import { Food } from "../entities/food";
import { len, Point, sub } from "../r2";
import { Entity } from "../entities/entity";
import { EntityLoader } from "../entities/loader";
import {
  shouldSpawnFlower,
  shouldSpawnFood,
  shouldSpawnRandomCutie,
  spawnRandomCutie,
  spawnRandomFood,
  spawnRandoms,
} from "./spawn";
import { cleanDepletedPellets, cleanOutOfBounds } from "./gc";
import {
  simCuties,
  simEggs,
  simFlowerRoots,
  simFlowers,
  simFood,
  simWaste,
} from "./sim";
import { Waste } from "../entities/waste";

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
      { x: 0, y: 0 },
      { x: width, y: height },
    ];
    this.entityLoader = new EntityLoader(width, height);
    this.selected = null;

    while (this.shouldSpawnFood()) {
      spawnRandomFood(this);
      this.entityLoader.init(this.entities);
    }
    for (let cutieIndex = 0; cutieIndex < 15; cutieIndex++) {
      spawnRandomCutie(this);
    }

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

  shouldSpawnFood = () => shouldSpawnFood(this.entityLoader);

  shouldSpawnFlower = () =>
    shouldSpawnFlower(this.iteration, this.entityLoader);

  shouldCleanupOutOfBounds = (): boolean => this.iteration % 60 === 0;

  getNearest = <T extends Entity>(
    qtree: Quadtree,
    point: Point,
    radius: number
  ): T[] =>
    qtree.retrieve({
      height: radius,
      width: radius,
      x: point.x - radius / 2,
      y: point.y - radius / 2,
    }) as T[];

  getNearestFood = (point: Point, radius: number): Food | undefined =>
    minBy(
      this.getNearest(this.entityLoader.qtrees.food, point, radius),
      (entity) => len(sub(entity.position, point))
    );

  getNearestWaste = (point: Point, radius: number): Waste[] | undefined =>
    this.getNearest(this.entityLoader.qtrees.waste, point, radius);

  clean = () => {
    cleanDepletedPellets(this.entityLoader.food);
    cleanDepletedPellets(this.entityLoader.waste);
    if (this.iteration % 5) {
      cleanOutOfBounds(this.entities, this.bounds);
    }
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
    simFlowers(this);
    simFlowerRoots(this);
    simEggs(this);
    simWaste(this);
    simFood(this);

    spawnRandoms(this);

    this.regenerate();

    this.clean();
    this.getStats();

    this.iteration++;
  };
}
