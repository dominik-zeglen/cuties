import { Cutie } from "./cutie";
import { Egg } from "./egg";
import { Entity } from "./entity";
import { Food } from "./food";
import { Waste } from "./waste";

export class EntityLoader {
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

    return this.entities.filter((entity) => entity instanceof Food) as Food[];
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
