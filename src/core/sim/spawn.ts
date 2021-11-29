import type { Sim } from ".";
import { getRandomCutie } from "../entities/cutie";
import { Food } from "../entities/food";
import type { EntityLoader } from "../entities/loader";
import { getRandomPositionInBounds } from "../r2";

export function shouldSpawnRandomCutie(
  it: number,
  loader: EntityLoader
): boolean {
  return it % 120 === 0 && loader.cuties.length < 15;
}

export function shouldSpawnFood(it: number, loader: EntityLoader): boolean {
  return it % 30 === 0 && loader.food.length < 800 - loader.cuties.length * 50;
}

export function spawnRandoms(sim: Sim) {
  if (sim.shouldSpawnRandomCutie()) {
    const cutie = getRandomCutie(sim.entityCounter, sim.iteration, sim.bounds);
    cutie.position = getRandomPositionInBounds(sim.bounds);
    sim.registerEntity(cutie);
  }

  if (sim.shouldSpawnFood()) {
    const food = new Food(sim.entityCounter, sim.iteration, {
      position: getRandomPositionInBounds(sim.bounds),
    });
    sim.registerEntity(food);
  }
}
