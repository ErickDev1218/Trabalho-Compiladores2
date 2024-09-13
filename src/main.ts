import { graphviz } from "node-graphviz";
import { Buffer } from "buffer";
import { group } from "console";


const input = 'PRIKITO(+(A,B),+(C,D))'

type TreeNode = {
  root: string;
  parent: TreeNode | null;
  leftChild: TreeNode | null;
  rightChild: TreeNode | null;
  group: Number;
};

const patternsTrees : TreeNode[] = [
  stringToTree("+"),
  stringToTree("*"),
  stringToTree("-"),
  stringToTree("/"),
  stringToTree("TEMP"),
  stringToTree("CONST"),
  stringToTree("+(CONST)"),
  stringToTree("MEM"),
  stringToTree("MEM(+(CONST))"),
  stringToTree("MOVE(MEM(+(CONST)))"),
  stringToTree("MOVE(MEM(CONST))"),
  stringToTree("MOVE(MEM)"),
  stringToTree("MOVE(MEM,MEM)"),
  stringToTree("MOVE(MEM(+(CONST)))")
]

let t1 = stringToTree("+(CONST,CONST)");
t1.leftChild = null;
patternsTrees.push(t1)

t1 = stringToTree("-(CONST,CONST)");
t1.leftChild = null;
patternsTrees.push(t1)

t1 = stringToTree("MEM(+(CONST,CONST))");
t1.leftChild.leftChild = null;
patternsTrees.push(t1)



function acceptsPatter(root : TreeNode, pattern : TreeNode) : boolean {
  if(root === null){
    return false;
  }
  const st_node = [root]
  const st_patt = [pattern]

  while(st_node.length !== 0 && st_patt.length !== 0) {
    const curr_node = st_node.pop();
    const curr_patt = st_patt.pop();

    if(curr_node.root === curr_patt.root 
      || (curr_patt.root === "CONST" && curr_node.root.startsWith("CONST"))
      || (curr_patt.root === "TEMP" && curr_node.root.startsWith("TEMP"))
    ) {
      if(curr_node.leftChild === null && curr_patt.leftChild !== null) {
        return false
      }
      if(curr_node.rightChild === null && curr_patt.rightChild !== null) {
        return false
      }

      if(curr_node.leftChild !== null && curr_patt.leftChild !== null) {
        st_node.push(curr_node.leftChild)
        st_patt.push(curr_patt.leftChild)
      }
      if(curr_node.rightChild !== null && curr_patt.rightChild !== null) {
        st_node.push(curr_node.rightChild)
        st_patt.push(curr_patt.rightChild)
      } 
    } else {
      return false;
    }
  }

  return true
}

function stringToTree(input : string) : TreeNode {
  const root = {
    root: "",
    parent: null,
    leftChild: null,
    rightChild: null,
    group: null
  } 

  let node = root

  for(const char of input) {
    switch(char) {
      case '(':
        node.leftChild = {
          root: "",
          parent: node,
          leftChild: null,
          rightChild: null,
          group: null
        }
        node = node.leftChild;
        break
      case ',':
        node.parent.rightChild = {
          root: "",
          parent: node.parent,
          leftChild: null,
          rightChild: null,
          group: null
        }
        node = node.parent.rightChild
        break;
      case ')':
        node = node.parent
        break
      default:
        node.root += char 
        break
    }
  }

  return root
}

async function ParseTreeToGraphvizB64(tree: TreeNode) {
  let globalId = 0
  const stack: TreeNode[] = []
  const idStack: number[] = []
  let graphvizStr = `digraph {
node[shape="box"]`
  stack.push(tree)
  idStack.push(globalId)

  while (stack.length !== 0) {
    const currNode = stack.pop()
    const currId = idStack.pop()
    graphvizStr += `\n${currId}[label="${currNode.root}"]\n`

    if (currNode.leftChild !== null) {
      globalId++
      stack.push(currNode.leftChild)
      idStack.push(globalId);
      graphvizStr += `${currId}->${globalId}\n`
    }
    if (currNode.rightChild !== null) {
      globalId++
      stack.push(currNode.rightChild)
      idStack.push(globalId);
      graphvizStr += `${currId}->${globalId}\n`
    }
  }

  graphvizStr += "\n}"
  console.log(graphvizStr);

  const svg = await graphviz.dot(graphvizStr, 'svg')
  // Convert the SVG to Base64
  return Buffer.from(svg).toString('base64');
}

function posOrdemPrint(tree: TreeNode) {
  if (tree === null) {
    return
  }
  posOrdemPrint(tree.leftChild)
  posOrdemPrint(tree.rightChild)
  console.log(tree.root)
}

export async function generateLinearStringB64(linearString) {
  const tree = stringToTree(linearString)
  posOrdemPrint(tree)
  const ret = await ParseTreeToGraphvizB64(tree)
  return ret;
}