import { Sim } from ".";
import { Cutie } from "../entities/cutie";
import { Food } from "../entities/food";

test("Gets nearest food", () => {
  const sim = new Sim(10, 10);

  sim.entities = [
    new Food(1, 1, {
      position: { x: -1, y: 1 },
    }),
    new Food(1, 1, {
      position: { x: 2, y: 1 },
    }),
  ];

  sim.entityLoader.init(sim.entities);
  const nearest = sim.getNearestFood({ x: 3, y: 1 });

  expect(nearest.id).toBe(1);
});

test("Properly calculates eaten food", () => {
  const cutie = new Cutie(2, 1, {
    ai: {
      angle: [],
      eat: [],
      layEgg: [],
      speed: [],
    },
    ancestors: 0,
    position: { x: 0, y: 0 },
  });
  cutie.hunger = 2;
  const food = new Food(1, 1, {
    position: { x: 0, y: 0 },
    value: 10,
  });

  cutie.eat(food);

  expect(food.value).toBe(8);
  expect(cutie.hunger).toBe(0);
});
