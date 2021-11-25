import { Cutie, CutieBrain } from "./cutie";
import { Entity } from "./entity";

export class Egg extends Entity {
  brain: CutieBrain;
  spawnTime: number;

  constructor(id: number, it: number) {
    super(id, it);
    this.spawnTime = 600;
  }

  shouldHatch = (it: number): boolean => {
    return it - this.createdAt === this.spawnTime;
  };

  hatch = (id: number, it: number): Cutie => {
    const cutie = new Cutie(id, it);
    cutie.position = { ...this.position };
    cutie.brain = this.brain;
    this.shouldDelete = true;

    return cutie;
  };
}
