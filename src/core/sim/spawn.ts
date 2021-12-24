import sum from "lodash/sum";
import type { Sim } from ".";
import { getRandomCutie } from "../entities/cutie";
import { getRandomFlower } from "../entities/flowers";
import { Food } from "../entities/food";
import type { EntityLoader } from "../entities/loader";
import { getRandomPositionInBounds } from "../r2";

export function shouldSpawnRandomCutie(
  it: number,
  loader: EntityLoader
): boolean {
  return it % 40 === 0 && loader.cuties.length < 5;
}

export function shouldSpawnFood(sim: Sim): boolean {
  const area = (sim.bounds[1].x * sim.bounds[1].y) / 1e6;

  return (
    sim.entityLoader.cuties.length < 5 &&
    sum(sim.entityLoader.food.map((pellet) => pellet.value)) <
      2e5 * area - sim.entityLoader.cuties.length * 5e3 * area
  );
}

export function shouldSpawnFlower(it: number, loader: EntityLoader): boolean {
  return it % 30 === 0 && loader.flowers.length < 5 && loader.waste.length > 20;
}

export function spawnRandomFood(sim: Sim) {
  const food = new Food({
    position: getRandomPositionInBounds(sim.bounds),
  });
  food.value *= Math.random() / 2 + 0.5;
  sim.registerEntity(food);
}

export function spawnRandomFlower(sim: Sim) {
  const flower = getRandomFlower(sim.bounds);
  sim.registerEntity(flower);
}

export function spawnRandomCutie(sim: Sim) {
  const cutie = getRandomCutie(sim.bounds);
  cutie.position = getRandomPositionInBounds(sim.bounds);
  sim.registerEntity(cutie);
}

export function spawnRandoms(sim: Sim) {
  if (sim.shouldSpawnRandomCutie()) {
    spawnRandomCutie(sim);
  }

  if (sim.shouldSpawnFood()) {
    spawnRandomFood(sim);
  }

  if (sim.shouldSpawnFlower()) {
    spawnRandomFlower(sim);
  }
}
