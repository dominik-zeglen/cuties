import { Sim } from ".";
import { getRandomCutieAi } from "../ai";
import { Cutie } from "../entities/cutie";
import { Food } from "../entities/food";
import { Remains } from "../entities/remains";

test("Gets nearest food", () => {
  const sim = new Sim(10, 10);
  sim.clear();

  [
    new Food({
      position: { x: -1, y: 1 },
    }),
    new Food({
      position: { x: 2, y: 1 },
    }),
  ].forEach(sim.registerEntity);

  sim.entityLoader.init(sim.entities);
  const nearest = sim.getNearestFood({ x: 3, y: 1 }, 10);

  expect(nearest.id).toBe(1);
});

test("Gets nearest cutie", () => {
  const sim = new Sim(10, 10);
  sim.clear();

  sim.registerEntity(
    new Cutie({
      ai: getRandomCutieAi(),
      ancestors: 0,
      angle: 0,
      position: {
        x: -5,
        y: -5,
      },
      color: "",
      shape: 0,
    })
  );

  sim.entityLoader.init(sim.entities);
  const nearest = sim.getNearestCutie({ x: -5, y: -5 }, 10, () => true);

  expect(nearest.id).toBe(0);
});

test("Gets nearest remains", () => {
  const sim = new Sim(10, 10);
  sim.clear();

  [
    new Remains({
      position: { x: -1, y: 1 },
      value: 1,
    }),
    new Remains({
      position: { x: 2, y: 1 },
      value: 1,
    }),
  ].forEach((food) => sim.registerEntity(food));

  sim.entityLoader.init(sim.entities);
  const nearest = sim.getNearestRemains({ x: 3, y: 1 }, 10);

  expect(nearest.id).toBe(1);
});

test("Properly calculates eaten food", () => {
  const cutie = new Cutie({
    angle: 0,
    ai: getRandomCutieAi(),
    ancestors: 0,
    position: { x: 0, y: 0 },
    color: "",
    shape: 0,
  });
  cutie.hunger = 2;
  const food = new Food({
    position: { x: 0, y: 0 },
    value: 10,
  });

  cutie.eat(food);

  expect(food.value).toBe(8);
  expect(cutie.hunger).toBe(0);
});
