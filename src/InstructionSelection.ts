import TreeNode, { stringToTree } from "./TreeNode.js"
import { printLine } from "./Utils.js"

type pattern = {
  patternTree : TreeNode
  patternLabel : string
}

const patterns : pattern[] = [
  {
    patternTree: stringToTree("TEMP"),
    patternLabel: "-TEMP-"
  },
  {
    patternTree: stringToTree("+"),
    patternLabel: "ADD"
  },
  {
    patternTree: stringToTree("*"),
    patternLabel: "MUL"
  },
  {
    patternTree: stringToTree("-"),
    patternLabel: "SUB"
  },
  {
    patternTree: stringToTree("/"),
    patternLabel: "DIV"
  },
  {
    patternTree: stringToTree("+(,CONST)"),
    patternLabel: "ADDI1"
  },
  {
    patternTree: stringToTree("+(CONST)"),
    patternLabel: "ADDI2"
  },
  {
    patternTree: stringToTree("CONST"),
    patternLabel: "ADDI3"
  },
  {
    patternTree: stringToTree("-(,CONST)"),
    patternLabel: "SUBI"
  },
  {
    patternTree: stringToTree("MEM(+(,CONST))"),
    patternLabel: "LOAD1"
  },
  {
    patternTree: stringToTree("MEM(+(CONST))"),
    patternLabel: "LOAD2"
  },
  {
    patternTree: stringToTree("MEM(CONST)"),
    patternLabel: "LOAD3"
  },
  {
    patternTree: stringToTree("MEM"),
    patternLabel: "LOAD4"
  },
  {
    patternTree: stringToTree("MOVE(MEM(+(,CONST)))"),
    patternLabel: "STORE1"
  },
  {
    patternTree: stringToTree("MOVE(MEM(+(CONST)))"),
    patternLabel: "STORE2"
  },
  {
    patternTree: stringToTree("MOVE(MEM(CONST))"),
    patternLabel: "STORE3"
  },
  {
    patternTree: stringToTree("MOVE(MEM)"),
    patternLabel: "STORE4"
  },
  {
    patternTree: stringToTree("MOVE(MEM,MEM)"),
    patternLabel: "MOVEM"
  }
]


/*---
translateFunc representa uma função de tradução que recebe um patter e um offset de registrado
e retorna uma tupla contendo o lado direito e esquerdo referente a tradução da instrução
---*/
type expLR = {left : string, right : string}
type translateFunc = (node : TreeNode) => expLR
let registerOffset = 0
const mapPatternLabelToTranslateFunc : Map<string, translateFunc> = new Map<string, translateFunc>()

/*---
Definir de forma manual as traduções dos padrões
---*/

mapPatternLabelToTranslateFunc.set("-TEMP-", (node) => {
  return { left: `${node.root.substring(5)}`, right: "" }
})

mapPatternLabelToTranslateFunc.set("ADD", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.leftChild.leftExp} + ${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("MUL", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.leftChild.leftExp} * ${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("SUB", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.leftChild.leftExp} - ${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("DIV", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.leftChild.leftExp} / ${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("ADDI1", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.leftChild.leftExp} + ${node.rightChild.root.substring(6)}`
  }
})

mapPatternLabelToTranslateFunc.set("ADDI2", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.rightChild.leftExp} + ${node.leftChild.root.substring(6)}`
  }
})

mapPatternLabelToTranslateFunc.set("ADDI3", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `r0 + ${node.root.substring(6)}`
  }
})

mapPatternLabelToTranslateFunc.set("SUBI", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `${node.leftChild.leftExp} - ${node.rightChild.root.substring(6)}`
  }
})

mapPatternLabelToTranslateFunc.set("LOAD1", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `M[${node.leftChild.leftChild.leftExp} + ${node.leftChild.rightChild.root.substring(6)}]`
  }
})

mapPatternLabelToTranslateFunc.set("LOAD2", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `M[${node.leftChild.rightChild.leftExp} + ${node.leftChild.leftChild.root.substring(6)}]`
  }
})

mapPatternLabelToTranslateFunc.set("LOAD3", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `M[r0 + ${node.leftChild.root.substring(6)}]`
  }
})


mapPatternLabelToTranslateFunc.set("LOAD4", (node) => {
  return {
    "left": `r${++registerOffset}`,
    "right": `M[${node.leftChild.root.substring(5)} + 0]`
  }
})

mapPatternLabelToTranslateFunc.set("STORE1", (node) => {
  return {
    "left": `M[${node.leftChild.leftChild.leftChild.leftExp} + ${node.leftChild.leftChild.rightChild.root.substring(6)}]`,
    "right": `${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("STORE2", (node) => {
  return {
    "left": `M[${node.leftChild.leftChild.rightChild.leftExp} + ${node.leftChild.leftChild.leftChild.root.substring(6)}]`,
    "right": `${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("STORE3", (node) => {
  return {
    "left": `M[r0 + ${node.leftChild.leftChild.root.substring(6)}]`,
    "right": `${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("STORE4", (node) => {
  return {
    "left": `M[${node.leftChild.leftChild.leftExp} + 0]`,
    "right": `${node.rightChild.leftExp}`
  }
})

mapPatternLabelToTranslateFunc.set("MOVEM", (node) => {
  return {
    "left": `M[${node.leftChild.leftChild.leftExp}]`,
    "right": `M[${node.rightChild.leftChild.leftExp}]`
  }
})

export function selectInstrunctions(root : TreeNode) {
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
    for(const pattern of patterns) {
      if(node.acceptsPatter(pattern.patternTree)) {
        const temp = node.clone()
        temp.applyPatter(pattern.patternTree)
        if(node.root === "-") {
          console.log(pattern.patternLabel)
          console.log(temp)
          console.log(node)
        }
        // Se for melhor que atual, então aplicar o pattern
        if(node.getCost() === null || (temp.getCost() !== null && temp.getCost() < node.getCost())) {
          node.applyPatter(pattern.patternTree)
          node.patternLabel = pattern.patternLabel
        }
      }
    }
  }
}

export function translateInstrunctions(root : TreeNode) : string[]{
  const stack1 : TreeNode[] = [root]
  const stack2 : TreeNode[] = []
  const code : string[] = []
  registerOffset = 0

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
    // Se o nó for um leder de instrção
    if(node.parent === null || node.parent.group !== node.group) {
      if(!mapPatternLabelToTranslateFunc.has(node.patternLabel)){
        throw new Error(`Tradução do patter -> {${node.patternLabel}} não existe`)
      }
      const expLR = mapPatternLabelToTranslateFunc.get(node.patternLabel)(node)
      node.leftExp = expLR.left
      node.rightExp = expLR.right
      // Isso faz com que a instrução temp não seja colocada no código final
      if(node.rightExp !== ""){
        code.push(`${expLR.left} <- ${expLR.right}`)
      }
    }
  }

  return code
}