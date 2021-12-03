import { Cutie } from "./cutie";
import { Egg } from "./egg";
import { Entity } from "./entity";
import { Flower } from "./flowers";
import { Food } from "./food";
import { Waste } from "./waste";

export class EntityLoader {
  entities: Entity[];

  cachedFood: Food[] | null;
  cachedCuties: Cutie[] | null;
  cachedFlowers: Flower[] | null;
  cachedEggs: Egg[] | null;
  cachedWaste: Waste[] | null;
  cachedFlowerRoots: Flower[] | null;

  constructor() {
    this.entities = [];
  }

  init = (entities: Entity[]) => {
    this.entities = entities;

    this.cachedFood = null;
    this.cachedCuties = null;
    this.cachedFlowers = null;
    this.cachedEggs = null;
    this.cachedWaste = null;
    this.cachedFlowerRoots = null;
  };

  get food(): Food[] {
    if (this.cachedFood) {
      return this.cachedFood;
    }

    return this.entities.filter((entity) => entity instanceof Food) as Food[];
  }

  get cuties(): Cutie[] {
    if (this.cachedCuties) {
      return this.cachedCuties;
    }

    return this.entities.filter((entity) => entity instanceof Cutie) as Cutie[];
  }

  get flowers(): Flower[] {
    if (this.cachedFlowers) {
      return this.cachedFlowers;
    }

    return this.entities.filter(
      (entity) => entity instanceof Flower
    ) as Flower[];
  }

  get flowerRoots(): Flower[] {
    if (this.cachedFlowers) {
      return this.cachedFlowers;
    }

    return (
      this.entities.filter((entity) => entity instanceof Flower) as Flower[]
    ).filter((flower) => !flower.parent);
  }

  get eggs(): Egg[] {
    if (this.cachedEggs) {
      return this.cachedEggs;
    }

    return this.entities.filter((entity) => entity instanceof Egg) as Egg[];
  }

  get waste(): Waste[] {
    if (this.cachedWaste) {
      return this.cachedWaste;
    }

    return this.entities.filter((entity) => entity instanceof Waste) as Waste[];
  }
}
