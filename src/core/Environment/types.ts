import { Entity } from "../entities/entity";
import { notImplemented } from "../errors";
import { Point } from "../r2";

export interface EnvironmentAoEInput {
  position: Point;
  radius: number;
}

export class EnvironmentAoE {
  position: Point;
  radius: number;

  constructor(input: EnvironmentAoEInput) {
    this.position = input.position;
    this.radius = input.radius;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  affect(entity: Entity) {
    throw notImplemented;
  }
}
