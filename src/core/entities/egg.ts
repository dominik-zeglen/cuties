import Color from "color";
import { Cutie } from "./cutie";
import { CutieAi, mutate } from "../ai";
import { Entity } from "./entity";
import settings from "../settings";

export class Egg extends Entity {
  ai: CutieAi;
  ancestors: number;
  spawnTime: number;
  color: string;
  shape: number;

  constructor(parent: Cutie) {
    super({ position: parent.position });
    this.spawnTime = 700;
    this.ai = Math.random() < 0.1 ? mutate(parent.ai, 1e-1) : parent.ai;
    this.ancestors = parent.ancestors + 1;
    this.color =
      Math.random() < 0.02
        ? Color(parent.color)
            .rotate(Math.random() * 360)
            .toString()
        : parent.color;
    this.shape =
      Math.random() < 0.02
        ? parent.shape + (Math.random() - 0.5) / 10
        : parent.shape;
    if (this.shape > settings.cutie.shape.max) {
      this.shape = settings.cutie.shape.max;
    } else if (this.shape < settings.cutie.shape.min) {
      this.shape = settings.cutie.shape.min;
    }
  }

  shouldHatch = (it: number): boolean => it - this.createdAt === this.spawnTime;

  hatch = (): Cutie => {
    const cutie = new Cutie({
      angle: (Math.random() - 0.5) * Math.PI * 2,
      position: this.position,
      ai: this.ai,
      ancestors: this.ancestors,
      color: this.color,
      shape: this.shape,
    });
    this.die();

    return cutie;
  };

  die = this.markToDelete;
}
