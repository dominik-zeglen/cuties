import { Emitter } from "../particle";
import { EmitterInput } from "./types";

export function createDefaultEmitter({
  position,
  radius,
}: EmitterInput): Emitter {
  return new Emitter({
    position,
    radius,
    force: 1,
    quantity: 15,
    spawnRate: 1,
    template: {
      color: "#FF00FF",
      size: 0.4,
      timeToLive: 30,
    },
  });
}
