import { Emitter } from "../particle";
import { createAttractorEmitter } from "./attractor";
import { createDefaultEmitter } from "./default";
import { EmitterInput } from "./types";

const map = {
  attractor: createAttractorEmitter,
  default: createDefaultEmitter,
};

export function createEmitter(input: EmitterInput): Emitter {
  if (!Object.keys(map).includes(input.type)) {
    return map.default(input);
  }

  return map[input.type](input);
}
