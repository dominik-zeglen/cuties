import { Cutie } from "./cutie";
import { CutieAi, mutate } from "./../ai";
import { Entity } from "./entity";

export class Egg extends Entity {
  ai: CutieAi;
  ancestors: number;
  spawnTime: number;

  constructor(id: number, it: number, parent: Cutie) {
    super(id, it);
    this.spawnTime = 800;
    this.position = { ...parent.position };
    this.ai = Math.random() < 0.25 ? mutate(parent.brain) : parent.brain;
    this.ancestors = parent.ancestors + 1;
  }

  shouldHatch = (it: number): boolean => {
    return it - this.createdAt === this.spawnTime;
  };

  hatch = (id: number, it: number): Cutie => {
    const cutie = new Cutie(id, it);
    cutie.position = { ...this.position };
    cutie.brain = this.ai;
    cutie.ancestors = this.ancestors;
    this.shouldDelete = true;

    return cutie;
  };
}
