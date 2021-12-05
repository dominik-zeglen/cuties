import { Cutie } from "./cutie";
import { CutieAi, mutate } from "../ai";
import { Entity } from "./entity";

export class Egg extends Entity {
  ai: CutieAi;
  ancestors: number;
  spawnTime: number;

  constructor(parent: Cutie) {
    super({ position: parent.position });
    this.spawnTime = 800;
    this.ai = Math.random() < 0.4 ? mutate(parent.ai) : parent.ai;
    this.ancestors = parent.ancestors + 1;
  }

  shouldHatch = (it: number): boolean => it - this.createdAt === this.spawnTime;

  hatch = (): Cutie => {
    const cutie = new Cutie({
      angle: (Math.random() - 0.5) * Math.PI * 2,
      position: this.position,
      ai: this.ai,
      ancestors: this.ancestors,
    });
    this.die();

    return cutie;
  };

  die = this.markToDelete;
}
