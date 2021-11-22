import { Entity } from "./entity";
import { add, Point, PolarPoint, toEuclidean } from "./r2";
import { getValueFromTree, Tree, TreeNode } from "./tree";

export type CutieInput = Record<
  "hunger" | "distanceToFood" | "angleToFood",
  number
>;
const inputKeys: Array<keyof CutieInput> = [
  "angleToFood",
  "distanceToFood",
  "hunger",
];

export type CutieOutput = Record<"speed" | "angle", number>;

export type CutieBrain = Record<keyof CutieOutput, Tree<CutieInput>>;

export interface CutieSimInput {
  nearestFood: PolarPoint;
}

export class Cutie extends Entity {
  brain: CutieBrain;
  hunger: number;

  constructor(id: number) {
    super(id);
    this.hunger = 0;
  }

  sim = (simInput: CutieSimInput): void => {
    const input: CutieInput = {
      angleToFood: simInput.nearestFood.angle,
      hunger: 10,
      distanceToFood: simInput.nearestFood.r,
    };

    const distance = (getValueFromTree(this.brain.speed, input) + 1) / 2;

    this.position = add(
      this.position,
      toEuclidean({
        angle: getValueFromTree(this.brain.angle, input) * 3.141,
        r: distance,
      })
    );
    this.hunger += 1 + distance;
  };
}

function getRandomCutieInputKey(): keyof CutieInput {
  return inputKeys[Math.floor(Math.random() * inputKeys.length)];
}

function getRandomCutieBrainNodeTree(): Tree<CutieInput> {
  return {
    key: getRandomCutieInputKey(),
    left: getRandomCutieBrainNode(),
    right: getRandomCutieBrainNode(),
    threshold: Math.random() * 2 - 1,
  };
}

export function getRandomCutieBrainNode(): TreeNode<CutieInput> {
  if (Math.random() < 0.6) {
    return Math.random() * 2 - 1;
  }

  return getRandomCutieBrainNodeTree();
}

export function getRandomCutieBrain(): CutieBrain {
  return {
    angle: getRandomCutieBrainNodeTree(),
    speed: getRandomCutieBrainNodeTree(),
  };
}

export function getRandomCutie(id: number): Cutie {
  const cutie = new Cutie(id);

  cutie.brain = getRandomCutieBrain();

  return cutie;
}
