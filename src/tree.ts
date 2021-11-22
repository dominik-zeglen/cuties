export type Input = Record<string, number>;

export interface TreeLeaf {
  isLeaf: boolean;
  value: number;
}
export interface TreeBranching<T extends Input> {
  left: TreeNode<T>;
  right: TreeNode<T>;
  threshold: number;
  key: keyof T;
  isLeaf: boolean;
}
export type TreeNode<T extends Input> = TreeBranching<T> | TreeLeaf;

function getValueFromTreeNode<T extends Input>(
  node: TreeNode<T>,
  state: T
): number {
  if (!node.isLeaf) {
    return getValueFromTree(node, state);
  }

  return (node as TreeLeaf).value;
}

export function getValueFromTree<T extends Input>(
  tree: TreeNode<T>,
  state: T
): number {
  if (!tree.isLeaf) {
    const node =
      (tree as TreeBranching<T>).threshold <
      state[(tree as TreeBranching<T>).key]
        ? (tree as TreeBranching<T>).left
        : (tree as TreeBranching<T>).right;

    return getValueFromTreeNode(node, state);
  }

  return (tree as TreeLeaf).value;
}

export function copyTree<T extends Input>(node: TreeNode<T>): TreeNode<T> {
  if (!node.isLeaf) {
    return {
      ...node,
      left: copyTree((node as TreeBranching<T>).left),
      right: copyTree((node as TreeBranching<T>).right),
    };
  }

  return node;
}

export function degree(node: TreeNode<any>): number {
  if (node.isLeaf) {
    return 1;
  }

  const leftDegree = degree((node as TreeBranching<any>).left);
  const rightDegree = degree((node as TreeBranching<any>).right);

  return (leftDegree > rightDegree ? leftDegree : rightDegree) + 1;
}
