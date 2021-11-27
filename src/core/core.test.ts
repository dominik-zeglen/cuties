import { Sim } from "./core";
import { Food } from "./entities/food";

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
