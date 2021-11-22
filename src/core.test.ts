import { Sim } from "./core";

test("Gets nearest food", () => {
  const sim = new Sim(10, 10);

  sim.food = [
    {
      id: 0,
      position: { x: -1, y: 1 },
    },
    {
      id: 1,
      position: { x: 2, y: 1 },
    },
  ];

  const nearest = sim.getNearestFood({ x: 3, y: 1 });

  expect(nearest.id).toBe(1);
});
