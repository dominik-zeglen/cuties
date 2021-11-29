import { Cutie } from "./cutie";
import { Egg } from "./egg";
import { Entity } from "./entity";
import { Food } from "./food";
import { Waste } from "./waste";

export class EntityLoader {
  entities: Entity[];

  cachedFood: Food[] | null;
  cachedCuties: Cutie[] | null;
  cachedEggs: Egg[] | null;
  cachedWaste: Waste[] | null;

  constructor() {
    this.entities = [];
  }

  init = (entities: Entity[]) => {
    this.entities = entities;

    this.cachedFood = null;
    this.cachedCuties = null;
    this.cachedEggs = null;
    this.cachedWaste = null;
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
