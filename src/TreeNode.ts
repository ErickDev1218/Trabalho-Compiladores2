// Used for get unique ids for groups
let globalId = 0

export default class TreeNode {
  root: string;
  parent: TreeNode | null;
  leftChild: TreeNode | null;
  rightChild: TreeNode | null;
  group: Number;

  constructor(
    root,
    parent = null,
    leftChild = null,
    rightChild = null,
    group = null
  ) {
    this.root = root;
    this.parent = parent;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
    this.group = group;
  }

  getCost() : number | null {
    const stack : TreeNode[] = [this] 
    let firstTemp = false;
    let cost = 0

    while(stack.length > 0) {
      const node = stack.pop()

      // Se a ávore tem um nó sem grupo, então seu custo é nulo (ou infinito)
      // isso obriga que todos os nós escolham ao menos um patter
      if(node.group === null) {
        return null
      }

      // So o grupo do pai do nó atual e do nó atual são diferentes, 
      // então o nó atual é um lider
      // ---
      // Se o nó é um lider então seu custo é contabilizado
      if(node.parent === null || node.parent.group !== node.group) {
        if(node.root.toLocaleUpperCase() === "MOVE") {
          // Caso movem onde o custo é 2
          if(node.leftChild !== null && node.leftChild.root.toUpperCase() === "MEM"
            && node.rightChild !== null && node.rightChild.root.toLocaleUpperCase() === "MEM"
          ) {
            cost += 2
          } else {
            cost += 1
          }
        }
        // O primeiro TEMP que aparece vale 0
        else if(node.root.toUpperCase().startsWith("TEMP") && !firstTemp) {
          firstTemp = true;
        } else {
          cost += 1;
        }
      }

      if(node.leftChild !== null) {
        stack.push(node.leftChild)
      }

      if(node.rightChild !== null) {
        stack.push(node.rightChild)
      }
    }

    return cost
  }


  // Remove todos os nó onde node.root === ""
  clearEmptyNodes() {
    const stack: TreeNode[] = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.leftChild !== null && node.leftChild.root === "") {
        node.leftChild = null;
      }
      if (node.leftChild !== null) {
        stack.push(node.leftChild);
      }
      if (node.rightChild !== null && node.rightChild.root === "") {
        node.rightChild = null;
      }
      if (node.rightChild !== null) {
        stack.push(node.rightChild);
      }
    }
  }

  clone(): TreeNode {
    const root = new TreeNode(null);

    const stack_this: TreeNode[] = [this];
    const stack_clone: TreeNode[] = [root];

    while (stack_this.length > 0) {
      const node_this = stack_this.pop();
      const node_clone = stack_clone.pop();

      // Copy root
      node_clone.root = node_this.root;

      // Copy left child
      if (node_this.leftChild !== null) {
        node_clone.leftChild = new TreeNode(
          node_this.leftChild.root,
          node_clone
        );
        stack_this.push(node_this.leftChild);
        stack_clone.push(node_clone.leftChild);
      }

      // Copy right child
      if (node_this.rightChild !== null) {
        node_clone.rightChild = new TreeNode(
          node_this.rightChild.root,
          node_clone
        );
        stack_this.push(node_this.rightChild);
        stack_clone.push(node_clone.rightChild);
      }
    }

    return root;
  }

  posOrdemPrint() {
    const stack1: TreeNode[] = [this];
    const stack2: TreeNode[] = [];

    while (stack1.length > 0) {
      const node = stack1.pop();

      stack2.push(node);

      console.log(node.root);
      if (node.leftChild !== null) {
        stack1.push(node.leftChild);
      }

      if (node.rightChild !== null) {
        stack1.push(node.rightChild);
      }
    }

    while (stack2.length > 0) {
      const node = stack2.pop();
      // console.log(node.root)
    }
  }
  
  /*--- 
  Funções realcionadas com Pattern
  ---*/
  
  acceptsPatter(pattern: TreeNode): boolean {
    if (this === null) {
      return false;
    }
    const st_node : TreeNode[] = [this];
    const st_patt : TreeNode[] = [pattern];

    while (st_node.length > 0 && st_patt.length > 0) {
      const curr_node = st_node.pop();
      const curr_patt = st_patt.pop();

      if (
        curr_node.root === curr_patt.root ||
        (curr_patt.root === "CONST" && curr_node.root.startsWith("CONST")) ||
        (curr_patt.root === "TEMP" && curr_node.root.startsWith("TEMP"))
      ) {
        if (curr_node.leftChild === null && curr_patt.leftChild !== null) {
          return false;
        }
        if (curr_node.rightChild === null && curr_patt.rightChild !== null) {
          return false;
        }

        if (curr_node.leftChild !== null && curr_patt.leftChild !== null) {
          st_node.push(curr_node.leftChild);
          st_patt.push(curr_patt.leftChild);
        }
        if (curr_node.rightChild !== null && curr_patt.rightChild !== null) {
          st_node.push(curr_node.rightChild);
          st_patt.push(curr_patt.rightChild);
        }
      } else {
        return false;
      }
    }

    return true;
  }

  // Aplicar um patter é basicamente unir todos os nós em um grupo 
  // que representa aquele pattern
  applyPatter(pattern : TreeNode) {
    if(!this.acceptsPatter(pattern)) {
      throw new Error("Tentando aplicar um padrão que não é aceito pela ávore")
    }
    const stack_this : TreeNode[] = [this]
    const stack_patt : TreeNode[] = [pattern]
    const groupId = ++globalId;

    while(stack_patt.length > 0) {
      const node_this = stack_this.pop()
      const node_patt = stack_patt.pop()
      node_this.group = groupId
      if(node_patt.leftChild !== null) {
        stack_this.push(node_this.leftChild)
        stack_patt.push(node_patt.leftChild)
      }
      if(node_patt.rightChild !== null) {
        stack_this.push(node_this.rightChild)
        stack_patt.push(node_patt.rightChild)
      }
    }
  }
}