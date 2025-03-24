class Node {
  constructor(value, height = 0, left = null, right = null, parent = null) {
    this.value = value;
    this.height = height;
    this.right = right;
    this.parent = parent;
    this.left = left;
  }
  calculateImbalance() {
    const leftHeight = this.left ? this.left.height : -1;
    const rightHeight = this.right ? this.right.height : -1;
    return leftHeight - rightHeight;
  }

  calculateHeight() {
    let leftHeight = this.left ? this.left.height : 0;
    let rightHeight = this.right ? this.right.height : 0;
    if (!this.left && !this.right) {
      return 0; // the node is a leaf
    }
    let newHeight = leftHeight > rightHeight ? leftHeight + 1 : rightHeight + 1;
    return newHeight;
  }

  bubbleHeight() {
    let node = this;
    if (node.isALeaf()) {
      node.height = 0;
      node = node.parent;
    }
    while (node) {
      let currentHeight = node.height;
      let newHeight = node.calculateHeight();
      if (newHeight != currentHeight) {
        node.height = newHeight;
        node = node.parent;
      } else {
        return;
      }
    }
  }

  isBalanceSubTree() {
    if (this.height === 0) {
      return true;
    }
    let leftHeight = this.left ? this.left.height : 0;
    let rightHeight = this.right ? this.right.height : 0;
    const currentLevelBalance = Math.abs(leftHeight - rightHeight) <= 1;
    const leftTreeBalance = this.left ? this.left.isBalanceSubTree() : true;
    const rightTreeBalance = this.right ? this.right.isBalanceSubTree() : true;
    return currentLevelBalance && leftTreeBalance && rightTreeBalance;
  }

  getDepth() {
    let node = this;
    let depth = 0;
    while (node.parent) {
      depth++;
      node = node.parent;
    }
    return depth;
  }
  isALeaf() {
    return !this.left && !this.right;
  }
}

class Tree {
  constructor(root = null) {
    this.root = root;
  }
  rotateLeft(node) {
    if (!node.right) {
      return;
    }
    const right = node.right;
    const rightLeftChild = right.left;
    const parent = node.parent;
    node.right = rightLeftChild;
    right.left = node;
    node.parent = right;
    if (rightLeftChild) {
      rightLeftChild.parent = node;
    }
    if (parent) {
      const nodeIsLeft = parent.left === node ? true : false;
      right.parent = parent;
      if (nodeIsLeft) {
        parent.left = right;
      } else {
        parent.right = right;
      }
    } else {
      right.parent = null;
    }
    if (this.root === node) {
      this.root = right;
    }

    // height which may have changed at the current level are node and right, then need to buble up
    node.height = node.calculateHeight();
    right.height = right.calculateHeight();
  }

  rotateRight(node) {
    if (!node.left) {
      return;
    }
    const left = node.left;
    const leftRightChild = left.right;
    const parent = node.parent;

    node.left = leftRightChild;
    left.right = node;
    node.parent = left;

    if (leftRightChild) {
      leftRightChild.parent = node;
    }

    if (parent) {
      const nodeIsLeft = parent.left === node;
      left.parent = parent;
      if (nodeIsLeft) {
        parent.left = left;
      } else {
        parent.right = left;
      }
    } else {
      left.parent = null;
    }

    if (this.root === node) {
      this.root = left;
    }
    node.height = node.calculateHeight();
    left.height = left.calculateHeight();
  }

  levelOrder(callback) {
    if (!this.root) {
      return;
    }
    let queue = [this.root];
    while (queue.length != 0) {
      queue.forEach(callback);
      queue = queue.map((node) => {
        const newElement = [];
        if (node.left) newElement.push(node.left);
        if (node.right) newElement.push(node.right);
        return newElement;
      });
      queue = queue.flat();
    }
  }

  findNext(node) {
    if (node.right) {
      let current = node.right;
      while (current.left) {
        current = current.left;
      }
      return current;
    } else {
      while (node.parent) {
        const nodeIsRight = node.parent.right === node;
        if (nodeIsRight) {
          return node.parent;
        }
        node = node.parent;
      }
      return null;
    }
  }

  isBalanced() {
    if (this.root === null) {
      return true;
    }
    return this.root.isBalanceSubTree();
  }

  find(value) {
    let current = this.root;
    while (current) {
      if (current.value === value) {
        return current;
      }
      current = current.value < value ? current.right : current.left;
    }
    return null;
  }

  insert(value) {
    // search for the place to implemant node
    if (!this.root) {
      this.root = new Node(value);
      return;
    }
    let current = this.root;
    while (true) {
      if (current.value === value) {
        return;
      }
      if (current.value > value) {
        if (current.left) {
          current = current.left;
        } else {
          break;
        }
      } else {
        if (current.right) {
          current = current.right;
        } else {
          break;
        }
      }
    }
    // now current is the parent of the new node
    const newNode = new Node(value, 0, null, null, current);
    if (current.value > value) {
      current.left = newNode;
    } else {
      current.right = newNode;
    }
    // now manage the tree rebalance
    // the current upper tree height might have change
    newNode.bubbleHeight();
    this.bubleUpRebalance(newNode);
  }

  bubleUpRebalance(node) {
    let next = node;
    while (next) {
      const nextParent = next.parent;
      this.rebalance(next);
      next = nextParent;
    }
  }

  rebalance(node) {
    // must rebalance the current node
    // assuming its subtreeheight is accurate and already calculated
    // return true if no changed are made and false otherwise
    // at the end node which were involved (node and its subtree) has an accurate height
    const imbalance = node.calculateImbalance();
    if (Math.abs(imbalance) <= 1) {
      return true;
    } else if (imbalance > 1) {
      // need to right rotate
      const leftImbalance = node.left.calculateImbalance(); // left node does exist has tree is balancing to the left
      if (leftImbalance === -1) {
        this.rotateLeft(node.left);
      }
      this.rotateRight(node);
      return false;
    } else {
      const rightImbalance = node.right.calculateImbalance(); // left node does exist has tree is balancing to the left
      if (rightImbalance === 1) {
        this.rotateRight(node.right);
      }
      this.rotateLeft(node);
    }
    return false;
  }

  remove(value) {
    // first step is to find the node
    let toBeRemoved = this.find(value);
    if (!toBeRemoved) {
      return null;
    }
    // if no child just need to cut links from parents and rebalance
    if (!toBeRemoved.left && !toBeRemoved.right) {
      if (toBeRemoved === this.root) {
        this.root = null;
        return;
      } else {
        const parent = toBeRemoved.parent;
        const left = parent.left === toBeRemoved ? true : false;
        if (left) {
          parent.left = null;
        } else {
          parent.right = null;
        }
        parent.bubbleHeight();
        this.bubleUpRebalance(parent);
        return;
      }
    }

    // if only one child
    else if (!toBeRemoved.left || !toBeRemoved.right) {
      const leftChildExists = toBeRemoved.left ? true : false;
      const child = leftChildExists ? toBeRemoved.left : toBeRemoved.right;
      // if toBeRemoved is the root if only one child and root the tree is a two node tree cause it is balanced so returning is OK
      if (toBeRemoved === this.root) {
        this.root = child;
        child.parent = null;
        return;
      }
      const parent = toBeRemoved.parent;
      const isLeftChild = parent.left === toBeRemoved ? true : false;
      if (isLeftChild) {
        parent.left = child;
      } else {
        parent.right = child;
      }
      child.parent = parent;
      child.bubbleHeight();
      this.bubleUpRebalance(child);
      return;
    }

    // if two child -> exchange with next in traversal order
    else {
      const next = this.findNext(toBeRemoved);
      toBeRemoved.value = next.value;
      // now need to handle the removal of next which is a leaf or
      // has one right child !
      if (!next.right) {
        const parent = next.parent;
        const left = parent.left === next ? true : false;
        if (left) {
          parent.left = null;
        } else {
          parent.right = null;
        }
        parent.bubbleHeight();
        this.bubleUpRebalance(parent);
        return;
      } else {
        //Next has only a right child which can't have itself child cause the tree is balanced at this point
        const nextRightChild = next.right;
        const parent = next.parent;
        const left = parent.left === next ? true : false;
        if (left) {
          parent.left = nextRightChild;
        } else {
          parent.right = nextRightChild;
        }
        nextRightChild.bubbleHeight();
        this.bubleUpRebalance(nextRightChild);
      }
    }
  }
}

function buildTreeFromArray(array) {
  // First sanityze the array -> remove duplicate and sort it O(nln(n))
  const set = new Set(array);
  array = Array.from(set).sort((a, b) => a - b);
  if (array.length == 0) {
    return new Tree();
  }
  const m = Math.floor(array.length / 2);
  const rootValue = array[m];
  const root = new Node(rootValue);
  const tree = new Tree(root);

  function recBuil(topOfTheSubTree, subarray, left = true) {
    if (subarray.length <= 1) {
      if (subarray.length == 0) {
        return;
      }
      const newTopOfTheSubTree = new Node(
        subarray[0],
        0,
        null,
        null,
        topOfTheSubTree
      );
      if (left) {
        topOfTheSubTree.left = newTopOfTheSubTree;
      } else {
        topOfTheSubTree.right = newTopOfTheSubTree;
      }
      return;
    } else {
      const m = Math.floor(subarray.length / 2);
      const newTopOfTheSubTree = new Node(
        subarray[m],
        0,
        null,
        null,
        topOfTheSubTree
      );
      if (left) {
        topOfTheSubTree.left = newTopOfTheSubTree;
      } else {
        topOfTheSubTree.right = newTopOfTheSubTree;
      }
      recBuil(newTopOfTheSubTree, subarray.slice(0, m));
      recBuil(newTopOfTheSubTree, subarray.slice(m + 1), false);
    }
    topOfTheSubTree.height = topOfTheSubTree.calculateHeight();
  }
  recBuil(root, array.slice(0, m));
  recBuil(root, array.slice(m + 1), false);
  return tree;
}

const prettyPrint = (node, prefix = "", isLeft = true) => {
  if (node === null) {
    return;
  }
  if (node.right !== null) {
    prettyPrint(node.right, `${prefix}${isLeft ? "│   " : "    "}`, false);
  }
  console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.value}`);
  if (node.left !== null) {
    prettyPrint(node.left, `${prefix}${isLeft ? "    " : "│   "}`, true);
  }
};

const tree = new Tree();

for (let i = 0; i < 40; i++) {
  tree.insert(Math.floor(Math.random() * 40));
}

prettyPrint(tree.root);

for (let i = 0; i < 40; i++) {
  tree.remove(Math.floor(Math.random() * 40));
}
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
prettyPrint(tree.root);
