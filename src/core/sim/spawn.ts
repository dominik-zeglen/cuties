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
  return it % 40 === 0 && loader.cuties.length < 20;
}

export function shouldSpawnFood(loader: EntityLoader): boolean {
  return (
    loader.cuties.length < 5 &&
    sum(loader.food.map((pellet) => pellet.value)) <
      5e5 - loader.cuties.length * 2e4
  );
}

export function shouldSpawnFlower(it: number, loader: EntityLoader): boolean {
  return (
    it % 30 === 0 && loader.flowers.length < 10 && loader.waste.length > 20
  );
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
