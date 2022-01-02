import { Entity } from "../entities/entity";
import { add, sub, toCartesian, toPolar } from "../r2";
import { EnvironmentAoE, EnvironmentAoEInput } from "./types";

export interface AttractorInput extends EnvironmentAoEInput {
  strength: number;
}

export class Attractor extends EnvironmentAoE {
  strength: number;

  constructor(input: AttractorInput) {
    super(input);
    this.strength = input.strength;
  }

  affect(entity: Entity) {
    const effectVec = toPolar(sub(this.position, entity.position));
    const forceVec = {
      angle: effectVec.angle,
      r: this.strength / effectVec.r ** 2,
    };

    if (forceVec.r > 1) {
      forceVec.r = 1;
    }

    entity.position = add(entity.position, toCartesian(forceVec));
  }
}
