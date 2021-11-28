import { Cutie } from "./cutie";
import { CutieAi, mutate } from "./../ai";
import { Entity } from "./entity";

export class Egg extends Entity {
  ai: CutieAi;
  ancestors: number;
  spawnTime: number;

  constructor(id: number, it: number, parent: Cutie) {
    super(id, it, { position: parent.position });
    this.spawnTime = 800;
    this.ai = Math.random() < 0.25 ? mutate(parent.ai) : parent.ai;
    this.ancestors = parent.ancestors + 1;
  }

  shouldHatch = (it: number): boolean => {
    return it - this.createdAt === this.spawnTime;
  };

  hatch = (id: number, it: number): Cutie => {
    const cutie = new Cutie(id, it, {
      position: this.position,
      ai: this.ai,
      ancestors: this.ancestors,
    });
    this.shouldDelete = true;

    return cutie;
  };
}
