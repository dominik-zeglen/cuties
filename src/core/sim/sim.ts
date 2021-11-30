import type { Sim } from ".";
import type { CutieSimInput } from "../entities/cutie";
import { Food } from "../entities/food";
import { sub, toPolar } from "../r2";

export function simCuties(sim: Sim) {
  sim.entityLoader.cuties.forEach((cutie) => {
    let simInput: CutieSimInput | null = null;
    if (sim.entityLoader.food.length && sim.iteration % 2 === 0) {
      const nearestFood = sim.getNearestFood(cutie.position, 300);
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
      }
    }

    cutie.sim(simInput);
    if (cutie.wantsToLayEgg() && cutie.canLayEgg(sim.iteration)) {
      sim.registerEntity(cutie.layEgg(sim.entityCounter, sim.iteration));
    }

    if (cutie.shouldDumpWaste()) {
      const waste = cutie.dumpWaste(sim.entityCounter, sim.iteration);
      if (sim.entityLoader.waste.length < 700) {
        sim.registerEntity(waste);
      }
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
  sim.entityLoader.waste.forEach((waste) => {
    if (waste.shouldBecomeFood(sim.iteration)) {
      waste.shouldDelete = true;
      const food = new Food(sim.entityCounter, sim.iteration, {
        position: waste.position,
      });
      sim.registerEntity(food);
    }
  });
}
