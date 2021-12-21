import { rotate } from "./r2";

test("Properly rotates point", () => {
  // Given
  const point = { x: -3, y: 6 };
  const angle = -Math.PI / 2;

  // When
  const rotated = rotate(point, -angle);

  // Then
  expect(rotated.x).toBeGreaterThan(-6 - 1e-4);
  expect(rotated.x).toBeLessThan(-6 + 1e-4);
  expect(rotated.y).toBeGreaterThan(-3 - 1e-4);
  expect(rotated.y).toBeLessThan(-3 + 1e-4);
});
