export type CutieInput = Record<
  | "hunger"
  | "foundFood"
  | "angleToFood"
  | "distanceToFood"
  | "foundCutie"
  | "angleToCutie"
  | "distanceToCutie"
  | "foundRemains"
  | "angleToRemains"
  | "distanceToRemains",
  number
>;

export type Matrix2d = number[][];
export type CutieOutput = Record<
  "speed" | "angle" | "layEgg" | "attack" | "eat",
  number
>;
export interface CutieAiLayer {
  biases: Matrix2d;
  weights: Matrix2d;
}
export type CutieAi = CutieAiLayer[];
