import QuadTree from "@timohausmann/quadtree-js";
import { Cutie } from "./cutie";
import { Egg } from "./egg";
import { Entity } from "./entity";
import { Flower } from "./flowers";
import { Food } from "./food";
import { Remains } from "./remains";
import { Waste } from "./waste";

export class EntityLoader {
  entities: Entity[];

  cachedFood: Food[] | null;
  cachedCuties: Cutie[] | null;
  cachedFlowers: Flower[] | null;
  cachedEggs: Egg[] | null;
  cachedWaste: Waste[] | null;
  cachedFlowerRoots: Flower[] | null;
  cachedRemains: Remains[] | null;

  width: number;
  height: number;

  qtrees: Record<"food" | "waste" | "cuties" | "remains", QuadTree | null>;

  constructor(width: number, height: number) {
    this.entities = [];
    this.width = width;
    this.height = height;
    this.qtrees = {
      food: new QuadTree(
        {
          height: this.height,
          width: this.width,
          x: 0,
          y: 0,
        },
        35,
        7
      ),
      waste: new QuadTree(
        {
          height: this.height,
          width: this.width,
          x: 0,
          y: 0,
        },
        35,
        6
      ),
      cuties: new QuadTree(
        {
          height: this.height,
          width: this.width,
          x: 0,
          y: 0,
        },
        35,
        5
      ),
      remains: new QuadTree(
        {
          height: this.height,
          width: this.width,
          x: 0,
          y: 0,
        },
        35,
        6
      ),
    };
  }

  init = (entities: Entity[]) => {
    this.entities = entities;

    this.cachedFood = null;
    this.cachedCuties = null;
    this.cachedFlowers = null;
    this.cachedEggs = null;
    this.cachedWaste = null;
    this.cachedFlowerRoots = null;
    this.cachedRemains = null;

    this.qtrees.food.clear();
    this.food.forEach((food) => this.qtrees.food.insert(food));
    this.qtrees.waste.clear();
    this.waste.forEach((waste) => this.qtrees.waste.insert(waste));
    this.qtrees.cuties.clear();
    this.cuties.forEach((cutie) => this.qtrees.cuties.insert(cutie));
    this.qtrees.remains.clear();
    this.remains.forEach((remains) => this.qtrees.remains.insert(remains));
  };

  get food(): Food[] {
    if (!this.cachedFood) {
      this.cachedFood = this.entities.filter(
        (entity) => entity instanceof Food
      ) as Food[];
    }

    return this.cachedFood;
  }

  get cuties(): Cutie[] {
    if (!this.cachedCuties) {
      this.cachedCuties = this.entities.filter(
        (entity) => entity instanceof Cutie
      ) as Cutie[];
    }
    return this.cachedCuties;
  }

  get flowers(): Flower[] {
    if (!this.cachedFlowers) {
      this.cachedFlowers = this.entities.filter(
        (entity) => entity instanceof Flower
      ) as Flower[];
    }

    return this.cachedFlowers;
  }

  get flowerRoots(): Flower[] {
    if (!this.cachedFlowerRoots) {
      this.cachedFlowerRoots = this.flowers.filter((flower) => !flower.parent);
    }

    return this.cachedFlowerRoots;
  }

  get eggs(): Egg[] {
    if (!this.cachedEggs) {
      this.cachedEggs = this.entities.filter(
        (entity) => entity instanceof Egg
      ) as Egg[];
    }

    return this.cachedEggs;
  }

  get waste(): Waste[] {
    if (!this.cachedWaste) {
      this.cachedWaste = this.entities.filter(
        (entity) => entity instanceof Waste
      ) as Waste[];
    }

    return this.cachedWaste;
  }

  get remains(): Remains[] {
    if (!this.cachedRemains) {
      this.cachedRemains = this.entities.filter(
        (entity) => entity instanceof Remains
      ) as Remains[];
    }

    return this.cachedRemains;
  }
}
