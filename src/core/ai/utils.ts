import { CutieInput, Matrix2d } from "./types";

export function getTargetInputMatrix(input: CutieInput): Matrix2d {
  return [
    [
      input.hunger,
      input.foundFood,
      input.angleToFood,
      input.distanceToFood,
      input.foundCutie,
      input.angleToCutie,
      input.distanceToCutie,
      input.foundRemains,
      input.angleToRemains,
      input.distanceToRemains,
    ],
  ];
}

export function limit(value: number, threshold: number): number {
  return value > threshold
    ? threshold
    : value < -threshold
    ? -threshold
    : value;
}
