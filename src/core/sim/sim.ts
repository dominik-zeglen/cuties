import type { Sim } from ".";
import type { CutieSimInput } from "../entities/cutie";
import { Waste } from "../entities/waste";
import { sub, toPolar } from "../r2";

export function simCuties(sim: Sim) {
  sim.entityLoader.cuties.forEach((cutie) => {
    let simInput: CutieSimInput | null = null;
    if (sim.entityLoader.food.length && sim.iteration % 2 === 0) {
      const nearestFood = sim.getNearestFood(cutie.position, 400);
      if (nearestFood) {
        const nearestFoodPolarPosition = toPolar(
          sub(cutie.position, nearestFood.position)
        );

        if (nearestFoodPolarPosition.r < 10 && cutie.wantsToEat()) {
          cutie.eat(nearestFood);
        }
        simInput = {
          nearestFood: nearestFoodPolarPosition,
        };
      } else {
        simInput = {
          nearestFood: { angle: 0, r: 0 },
        };
      }
    }

    cutie.sim(simInput);
    if (cutie.wantsToLayEgg() && cutie.canLayEgg(sim.iteration)) {
      sim.registerEntity(cutie.layEgg(sim.entityCounter, sim.iteration));
    }

    if (cutie.shouldDumpWaste()) {
      const waste = cutie.dumpWaste(sim.entityCounter, sim.iteration);
      sim.registerEntity(waste);
    }

    if (cutie.shouldDelete) {
      const remains = new Waste(sim.entityCounter, sim.iteration, {
        position: cutie.position,
      });
      remains.value = 100;
      sim.registerEntity(remains);
    }
  });
}

export function simFlowers(sim: Sim) {
  sim.entityLoader.flowers.forEach((flower) => {
    flower.sim({
      iteration: sim.iteration,
      waste: sim.getNearestWaste(flower.position, 70),
    });

    if (flower.canProduce(sim.iteration)) {
      sim.registerEntity(flower.produce(sim.entityCounter, sim.iteration));
    }

    if (flower.canSpawnFood()) {
      sim.registerEntity(flower.spawnFood(sim.entityCounter, sim.iteration));
    }
  });
}

export function simEggs(sim: Sim) {
  sim.entityLoader.eggs.forEach((egg) => {
    if (egg.shouldHatch(sim.iteration)) {
      sim.registerEntity(egg.hatch(sim.entityCounter, sim.iteration));
    }
  });
}

export function simWaste(sim: Sim) {
  sim.entityLoader.waste.forEach((waste) => waste.sim());
}
