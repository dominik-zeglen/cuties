import { Flower } from "./flowers";

test("Properly deletes itself from tree after death", () => {
  // Given
  const f1 = new Flower({
    angle: 0,
    parent: null,
    position: { x: 0, y: 0 },
    produces: "",
  });
  const f2 = new Flower({
    angle: 0,
    parent: f1,
    position: { x: 1, y: 0 },
    produces: "",
  });
  f1.next = [f2];
  const f3 = new Flower({
    angle: 0,
    parent: f2,
    position: { x: 2, y: 0 },
    produces: "",
  });
  f2.next = [f3];

  // When
  f2.die();

  // Then
  expect(f2.shouldDelete).toBe(true);
  expect(f1.next).toHaveLength(0);
  expect(f3.parent).toBeNull();
});
