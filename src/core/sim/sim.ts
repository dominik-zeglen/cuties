import type { Sim } from ".";
import { Cutie, CutieSimInput, rangeRadius } from "../entities/cutie";
import { Flower, rangeRadius as flowerRangeRadius } from "../entities/flowers";
import { Waste } from "../entities/waste";
import { sub, toPolar } from "../r2";

export function getCutieInput(cutie: Cutie, sim: Sim): CutieSimInput {
  let simInput: CutieSimInput | null = null;
  const nearestFood = sim.getNearestFood(cutie.position, rangeRadius);
  if (nearestFood) {
    const nearestFoodPolarPosition = toPolar(
      sub(cutie.position, nearestFood.position)
    );

    if (nearestFoodPolarPosition.r < 10 && cutie.wantsToEat()) {
      cutie.eat(nearestFood);
    }
    simInput = {
      iteration: sim.iteration,
      nearestFood: nearestFoodPolarPosition,
    };
  } else {
    simInput = {
      iteration: sim.iteration,
      nearestFood: null,
    };
  }

  return simInput;
}

export function simCutie(cutie: Cutie, sim: Sim): void {
  cutie.sim(getCutieInput(cutie, sim));
  if (cutie.wantsToLayEgg() && cutie.canLayEgg()) {
    sim.registerEntity(cutie.layEgg(sim.iteration));
  }

  if (cutie.shouldDumpWaste()) {
    const waste = cutie.dumpWaste();
    sim.registerEntity(waste);
  }

  if (cutie.shouldDelete) {
    const remains = new Waste({
      position: cutie.position,
    });
    remains.value = 100;
    sim.registerEntity(remains);
  }
}

export function simCuties(sim: Sim) {
  sim.entityLoader.cuties.forEach((cutie) => simCutie(cutie, sim));
}

function simFlower(flower: Flower, sim: Sim) {
  flower.sim({
    iteration: sim.iteration,
    waste: sim.getNearestWaste(flower.position, flowerRangeRadius).slice(0, 3),
  });

  if (flower.canProduce(sim.iteration)) {
    flower.produce().forEach(sim.registerEntity);
  }

  if (flower.canSpawnFood()) {
    sim.registerEntity(flower.spawnFood());
  }
}

export function simFlowers(sim: Sim) {
  sim.entityLoader.flowers.forEach((root) => simFlower(root, sim));
}

export function simFlowerRoots(sim: Sim) {
  sim.entityLoader.flowerRoots.forEach((root) => root.applyForce());
}

export function simEggs(sim: Sim) {
  sim.entityLoader.eggs.forEach((egg) => {
    if (egg.shouldHatch(sim.iteration)) {
      sim.registerEntity(egg.hatch());
    }
  });
}

export function simWaste(sim: Sim) {
  sim.entityLoader.waste.forEach((waste) => waste.sim());
}

export function simFood(sim: Sim) {
  sim.entityLoader.food.forEach((food) => food.sim());
}
