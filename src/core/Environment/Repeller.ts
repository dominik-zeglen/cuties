import { Entity } from "../entities/entity";
import { add, sub, toCartesian, toPolar } from "../r2";
import { EnvironmentAoE, EnvironmentAoEInput } from "./types";

export interface RepellerInput extends EnvironmentAoEInput {
  strength: number;
}

export class Repeller extends EnvironmentAoE {
  strength: number;

  constructor(input: RepellerInput) {
    super(input);
    this.strength = input.strength;
  }

  affect(entity: Entity) {
    const effectVec = toPolar(sub(this.position, entity.position));
    const forceVec = {
      angle: effectVec.angle,
      r: -this.strength / effectVec.r ** 2,
    };

    if (effectVec.r < 10) {
      forceVec.r = 1;
    }

    entity.position = add(entity.position, toCartesian(forceVec));
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  get type(): string {
    return "repeller";
  }
}
