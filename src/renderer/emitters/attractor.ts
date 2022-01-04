import { Emitter } from "../particle";
import { EmitterInput } from "./types";

export function createAttractorEmitter({
  position,
  radius,
}: EmitterInput): Emitter {
  return new Emitter({
    position,
    radius,
    force: -0.25,
    quantity: 15,
    spawnRate: 1,
    template: {
      color: "rgba(102, 204, 255)",
      size: 0.4,
      timeToLive: 30,
    },
  });
}
