import { copyTree, TreeBranching, TreeNode } from "./tree";

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
const outputKeys: Array<keyof CutieOutput> = ["angle", "speed"];

export type CutieBrain = Record<keyof CutieOutput, TreeNode<CutieInput>>;

function getRandomCutieInputKey(): keyof CutieInput {
  return inputKeys[Math.floor(Math.random() * inputKeys.length)];
}

function getRandomCutieBrainNodeTree(): TreeNode<CutieInput> {
  return {
    key: getRandomCutieInputKey(),
    left: getRandomCutieBrainNode(),
    right: getRandomCutieBrainNode(),
    threshold: Math.random() * 2 - 1,
    isLeaf: false,
  };
}

export function getRandomCutieBrainNode(): TreeNode<CutieInput> {
  if (Math.random() < 0.55) {
    return {
      isLeaf: true,
      value: Math.random() * 2 - 1,
    };
  }

  return getRandomCutieBrainNodeTree();
}

export function getRandomCutieBrain(): CutieBrain {
  return {
    angle: getRandomCutieBrainNodeTree(),
    speed: getRandomCutieBrainNodeTree(),
  };
}

function mutateNode(node: TreeNode<CutieInput>): TreeNode<CutieInput> {
  if (Math.random() > 0.75) {
    return getRandomCutieBrainNode();
  }

  if (!node.isLeaf) {
    return {
      ...node,
      left: mutateNode((node as TreeBranching<CutieInput>).left),
      right: mutateNode((node as TreeBranching<CutieInput>).right),
    };
  }

  return node;
}

export function mutate(brain: CutieBrain): CutieBrain {
  const mutated = {
    angle: copyTree(brain.angle),
    speed: copyTree(brain.speed),
  };
  const key = outputKeys[Math.floor(Math.random() * outputKeys.length)];

  mutated[key] = mutateNode(mutated[key]);

  return mutated;
}
