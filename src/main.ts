import { graphviz } from "node-graphviz";
import { Buffer } from "buffer";

// const input = '+(CONST1,CONST2)'
const input = 'PRIKITO(+(A,B),+(C,D))'

type TreeNode = {
  root: string;
  parent?: TreeNode;
  leftChild?: TreeNode;
  rightChild?: TreeNode;
};

function stringToTree(input : string) : TreeNode {
  const root = {
    root: "",
    parent: null,
    leftChild: null,
    rightChild: null
  } 

  let node = root

  for(const char of input) {
    switch(char) {
      case '(':
        node.leftChild = {
          root: "",
          parent: node,
          leftChild: null,
          rightChild: null
        }
        node = node.leftChild;
        break
      case ',':
        node.parent.rightChild = {
          root: "",
          parent: node.parent,
          leftChild: null,
          rightChild: null
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

async function generateGraphInBase64(graph): Promise<string> {
  return new Promise((resolve, reject) => {
    graph.output({ type: "svg" }, (imageData) => {
      if (imageData) {
        // Convertendo para Base64
        const base64Image = Buffer.from(imageData).toString("base64");
        resolve(base64Image);
      } else {
        reject("Erro ao gerar o grafo.");
      }
    });
  });
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
  // console.log(graphvizStr);

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