export type Input = Record<string, number>;

export type TreeNode<T extends Input> = Tree<T> | number;
export interface Tree<T extends Input> {
  left: TreeNode<T>;
  right: TreeNode<T>;
  threshold: number;
  key: keyof T;
}

function getValueFromTreeNode<T extends Input>(
  node: TreeNode<T>,
  state: T
): number {
  if (typeof node === "object") {
    return getValueFromTree(node, state);
  }
  return node;
}

export function getValueFromTree<T extends Input>(
  tree: Tree<T>,
  state: T
): number {
  const node = tree.threshold < state[tree.key] ? tree.left : tree.right;

  return getValueFromTreeNode(node, state);
}
