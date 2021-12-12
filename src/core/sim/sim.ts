import type { Sim } from ".";
import {
  Cutie,
  CutieSimInput,
  maxHunger,
  rangeRadius,
} from "../entities/cutie";
import { Flower, rangeRadius as flowerRangeRadius } from "../entities/flowers";
import { Remains } from "../entities/remains";
import { PolarPoint, sub, toPolar } from "../r2";

export function getCutieInput(
  cutie: Cutie,
  sim: Sim,
  nearestFoodPolarPosition: PolarPoint | undefined,
  nearestCutiePolarPosition: PolarPoint | undefined,
  nearestRemainsPolarPosition: PolarPoint | undefined
): CutieSimInput {
  const simInput: CutieSimInput = {
    iteration: sim.iteration,
    nearestFood: null,
    nearestCutie: null,
    nearestRemains: null,
  };

  if (nearestFoodPolarPosition) {
    simInput.nearestFood = nearestFoodPolarPosition;
  }

  if (nearestCutiePolarPosition) {
    simInput.nearestCutie = nearestCutiePolarPosition;
  }

  if (nearestRemainsPolarPosition) {
    simInput.nearestRemains = nearestRemainsPolarPosition;
  }

  return simInput;
}

export function simCutie(cutie: Cutie, sim: Sim, think: boolean): void {
  const nearestFood = sim.getNearestFood(cutie.position, rangeRadius);
  let nearestFoodPolarPosition: PolarPoint | null = null;
  let actionTaken = false;

  if (nearestFood && cutie.wantsToEat()) {
    nearestFoodPolarPosition = toPolar(
      sub(nearestFood.position, cutie.position)
    );

    if (nearestFoodPolarPosition.r < 10 && cutie.wantsToEat()) {
      cutie.eat(nearestFood);
      actionTaken = true;
    }
  }

  const nearestCutie = sim.getNearestCutie(
    cutie.position,
    rangeRadius,
    (candidateCutie) => candidateCutie.id !== cutie.id
  );
  let nearestCutiePolarPosition: PolarPoint | null = null;

  if (nearestCutie && cutie.wantsToEat()) {
    nearestCutiePolarPosition = toPolar(
      sub(nearestCutie.position, cutie.position)
    );

    if (
      !actionTaken &&
      nearestCutiePolarPosition.r < 10 &&
      cutie.canAttack(sim.iteration) &&
      cutie.wantsToAttack()
    ) {
      cutie.attack(sim.iteration, nearestCutie);
      actionTaken = true;
    }
  }

  const nearestRemains = sim.getNearestRemains(cutie.position, rangeRadius);
  let nearestRemainsPolarPosition: PolarPoint | null = null;

  if (nearestRemains && cutie.wantsToEat()) {
    nearestRemainsPolarPosition = toPolar(
      sub(nearestRemains.position, cutie.position)
    );

    if (
      !actionTaken &&
      nearestRemainsPolarPosition.r < 10 &&
      cutie.wantsToAttack()
    ) {
      cutie.eat(nearestRemains);
      actionTaken = true;
    }
  }

  cutie.sim(
    think
      ? getCutieInput(
          cutie,
          sim,
          nearestFoodPolarPosition,
          nearestCutiePolarPosition,
          nearestRemainsPolarPosition
        )
      : null
  );

  if (cutie.wantsToLayEgg() && cutie.canLayEgg()) {
    sim.registerEntity(cutie.layEgg(sim.iteration));
  }

  if (cutie.shouldDumpWaste()) {
    const waste = cutie.dumpWaste();
    sim.registerEntity(waste);
  }

  if (cutie.shouldDelete) {
    const remains = new Remains({
      position: cutie.position,
      value: 100 + maxHunger - cutie.hunger,
    });
    sim.registerEntity(remains);
  }
}

export function simCuties(sim: Sim) {
  sim.entityLoader.cuties.forEach((cutie) => simCutie(cutie, sim, true));
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

export function simRemains(sim: Sim) {
  sim.entityLoader.remains.forEach((remains) => remains.sim());
}
