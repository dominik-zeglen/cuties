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
  spawnRandomFlower,
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
  simRemains,
  simWaste,
} from "./sim";
import { Waste } from "../entities/waste";
import { Cutie } from "../entities/cutie";
import { Remains } from "../entities/remains";
import { Flower } from "../entities/flowers";
import { Egg } from "../entities/egg";

const isNode = typeof window === "undefined";

export class Sim {
  bounds: Point[];
  entities: Entity[];
  iteration: number;
  paused: boolean;
  selected: string | null;
  entityLoader: EntityLoader;
  entityCounter: number;
  randomSpawns: boolean;

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
    this.randomSpawns = true;

    while (this.shouldSpawnFood()) {
      spawnRandomFood(this);
      this.entityLoader.init(this.entities);
    }
    for (let cutieIndex = 0; cutieIndex < 100; cutieIndex++) {
      spawnRandomCutie(this);
    }
    for (let flowerIndex = 0; flowerIndex < 30; flowerIndex++) {
      spawnRandomFlower(this);
    }

    this.entityLoader.init(this.entities);

    if (!isNode) {
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
  }

  clear = () => {
    this.entities = [];
    this.entityLoader.init(this.entities);
    this.entityCounter = 0;
  };

  pause = () => {
    this.paused = true;
  };

  run = () => {
    this.paused = false;
  };

  shouldSpawnRandomCutie = () =>
    shouldSpawnRandomCutie(this.iteration, this.entityLoader);

  shouldSpawnFood = () => shouldSpawnFood(this);

  shouldSpawnFlower = () =>
    shouldSpawnFlower(this.iteration, this.entityLoader);

  shouldCleanupOutOfBounds = (): boolean => this.iteration % 60 === 0;

  getById = <T extends Entity>(id: number): T | undefined =>
    this.entities.find((entity) => entity.id === id) as T;

  getNearest = <T extends Entity>(
    qtree: Quadtree,
    point: Point,
    radius: number
  ): T[] =>
    qtree.retrieve({
      height: radius * 2,
      width: radius * 2,
      x: point.x - radius,
      y: point.y - radius,
    }) as T[];

  getNearestFood = (point: Point, radius: number): Food | undefined =>
    minBy(
      this.getNearest(this.entityLoader.qtrees.food, point, radius),
      (entity) => len(sub(entity.position, point))
    );

  getNearestRemains = (point: Point, radius: number): Remains | undefined =>
    minBy(
      this.getNearest(this.entityLoader.qtrees.remains, point, radius),
      (entity) => len(sub(entity.position, point))
    );

  getNearestCutie = (
    point: Point,
    radius: number,
    // eslint-disable-next-line no-unused-vars
    filter: (cutie: Cutie) => boolean
  ): Cutie | undefined =>
    minBy(
      (
        this.getNearest(
          this.entityLoader.qtrees.cuties,
          point,
          radius
        ) as Cutie[]
      ).filter(filter),
      (entity) => len(sub(entity.position, point))
    );

  getNearestWaste = (point: Point, radius: number): Waste[] | undefined =>
    this.getNearest(this.entityLoader.qtrees.waste, point, radius);

  clean = () => {
    cleanDepletedPellets(this.entityLoader.food);
    cleanDepletedPellets(this.entityLoader.waste);
    cleanDepletedPellets(this.entityLoader.remains);
    if (this.iteration % 5) {
      cleanOutOfBounds(this.entities, this.bounds);
    }
    this.entities = this.entities.filter((entity) => !entity.shouldDelete);
  };

  getStats = () => {
    if (this.iteration % 120 === 0 && !isNode) {
      window.cuties.stats = {
        itPerSecond: 120000 / (Date.now() - window.cuties.lastReload),
      };
      window.cuties.lastReload = Date.now();
      window.cuties.iteration = this.iteration;
    }
  };

  registerEntity = (entity: Entity): boolean => {
    if (entity instanceof Flower && this.entityLoader.flowers.length > 350) {
      entity.die();
    }

    if (entity instanceof Cutie && this.entityLoader.cuties.length > 300) {
      entity.die();
    }

    if (entity instanceof Waste && this.entityLoader.waste.length > 400) {
      entity.die();
    }

    if (entity instanceof Remains && this.entityLoader.remains.length > 200) {
      entity.die();
    }

    if (entity instanceof Egg && this.entityLoader.eggs.length > 100) {
      entity.die();
    }

    if (entity instanceof Food && this.entityLoader.food.length > 500) {
      entity.die();
    }

    entity.id = this.entityCounter;
    entity.createdAt = this.iteration;

    this.entities.push(entity);
    this.entityCounter++;

    return true;
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
    simRemains(this);

    if (this.randomSpawns) {
      spawnRandoms(this);
    }

    this.regenerate();
    this.clean();

    this.getStats();

    this.iteration++;
  };
}
