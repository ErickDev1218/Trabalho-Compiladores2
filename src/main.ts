import { graphviz } from "node-graphviz";
import { Buffer } from "buffer";
import TreeNode from "./TreeNode.js";
import { randomHexColor } from "./utils.js";

const patternsTrees : TreeNode[] = [
  stringToTree("+"),
  stringToTree("*"),
  stringToTree("-"),
  stringToTree("/"),
  stringToTree("TEMP"),
  stringToTree("CONST"),
  stringToTree("+(CONST)"),
  stringToTree("+(,CONST)"),
  stringToTree("-(,CONST)"),
  stringToTree("MEM"),
  stringToTree("MEM(+(CONST))"),
  stringToTree("MEM(+(,CONST))"),
  stringToTree("MOVE(MEM(+(CONST)))"),
  stringToTree("MOVE(MEM(CONST))"),
  stringToTree("MOVE(MEM)"),
  stringToTree("MOVE(MEM,MEM)"),
  stringToTree("MOVE(MEM(+(CONST)))")
]

// const t1 = stringToTree("+(MEM(+(TEMP_FP,CONST_a)),*(TEMP_i,CONST_4))")
// selectInstrunctions(t1)
// console.log(t1)
// console.log(t1.getCost())
// ParseTreeToGraphvizB64(t1)

function selectInstrunctions(root : TreeNode) {
  const stack1 : TreeNode[] = [root]
  const stack2 : TreeNode[] = []

  while(stack1.length > 0) {
    const node = stack1.pop()

    stack2.push(node)

    if(node.leftChild !== null) {
      stack1.push(node.leftChild)
    }
    
    if(node.rightChild !== null) {
      stack1.push(node.rightChild)
    }
  }

  // Pós-ordem aqui
  while(stack2.length > 0) {
    const node = stack2.pop()

    // Testar todos os patters para escolher o melhor
    for(const pattern of patternsTrees) {
      if(node.acceptsPatter(pattern)) {
        const temp = node.clone()
        temp.applyPatter(pattern)
        // Se for melhor que atual, então aplicar o pattern
        if(node.getCost() === null || temp.getCost() < node.getCost()) {
          node.applyPatter(pattern)
        }
      }
    }
  }
}


function stringToTree(input : string) : TreeNode {
  const root = new TreeNode("")

  let node = root

  for(let i = 0; i < input.length; i++) {
    const char = input[i]
    switch(char) {
      case '(':
        node.leftChild = new TreeNode("", node)
        node = node.leftChild;
        break
      case ',':
        node.parent.rightChild = new TreeNode("", node.parent)
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

  root.clearEmptyNodes()

  return root
}

async function ParseTreeToGraphvizB64(tree: TreeNode) {
  let globalId = 0
  const stack: TreeNode[] = []
  const idStack: number[] = []
  const colorMap: Map<Number, string> = new Map<Number, string>()
  let graphvizStr = `graph {
node[shape="box"]`
  stack.push(tree)
  idStack.push(globalId)

  while (stack.length !== 0) {
    const currNode = stack.pop()
    const currId = idStack.pop()
    if(currNode.group !== null) {
      if(!colorMap.has(currNode.group)){
        colorMap.set(currNode.group, randomHexColor())
      }
      graphvizStr += `\n${currId}[label="${currNode.root}",style="filled",fillcolor="${colorMap.get(currNode.group)}"]\n`
    } else {
      graphvizStr += `\n${currId}[label="${currNode.root}"]\n`
    }

    if (currNode.leftChild !== null) {
      globalId++
      stack.push(currNode.leftChild)
      idStack.push(globalId);
      graphvizStr += `${currId}--${globalId}\n`
      // Adicionar nó fantasmas, isso ajuda a vizualizar que o nó a seguir é o esquerdo
      // No caso do nó ser MEM isso não precisa ser feito
      if(currNode.root !== "MEM" && currNode.rightChild === null) {
        globalId++
        graphvizStr += `\n${globalId}[style=invis]\n`
        graphvizStr += `${currId}--${globalId}[style=invis]\n`
      }
    }
    if (currNode.rightChild !== null) {
      // Adicionar nó fantasmas, isso ajuda a vizualizar que o nó a seguir é o direito
      if(currNode.root !== "MEM" && currNode.leftChild === null) {
        globalId++
        graphvizStr += `\n${globalId}[style=invis]\n`
        graphvizStr += `${currId}--${globalId}[style=invis]\n`
      }
      globalId++
      stack.push(currNode.rightChild)
      idStack.push(globalId);
      graphvizStr += `${currId}--${globalId}\n`
    }
  }

  graphvizStr += "\n}"
  // console.log(graphvizStr);

  const svg = await graphviz.dot(graphvizStr, 'svg')
  // Convert the SVG to Base64
  return Buffer.from(svg).toString('base64');
}

export async function generateLinearStringB64(linearString) {
  const tree = stringToTree(linearString)
  selectInstrunctions(tree)
  // console.log(tree)
  // tree.posOrdemPrint()
  const ret = await ParseTreeToGraphvizB64(tree)
  return ret;
}

export function getTreeCost(linearString) {
  const tree = stringToTree(linearString)
  selectInstrunctions(tree)
  return tree.getCost();
}