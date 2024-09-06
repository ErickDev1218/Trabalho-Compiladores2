import fs from "fs";
import { graphviz } from "node-graphviz";
import { Buffer } from "buffer";

enum OPERATOR {
  SUM, // SOMA
  SUB, // SUBTRACAO
  DIV, // DIVISAO
  MUL, // MULTIPLICACAO
  MEM, // LOAD
  MEV, // MOVEM
  MOV, // STORE
  OPP, // (
  CPP, // )
}

const operatorsMap: Map<string, OPERATOR> = new Map<string, OPERATOR>([
  ["+", OPERATOR.SUM],
  ["-", OPERATOR.SUB],
  ["/", OPERATOR.DIV],
  ["*", OPERATOR.MUL],
  ["MEM", OPERATOR.MEM],
  ["MOV", OPERATOR.MOV],
  ["(", OPERATOR.OPP],
  [")", OPERATOR.CPP],
]);

type TreeNode = {
  root: string;
  childLeft?: TreeNode;
  childRight?: TreeNode;
};

function splitLinearString(str: string): string[] {
  const chars: string[] = str.split("");
  const ret: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    if (operatorsMap.has(chars[i])) {
      ret.push(chars[i]);
    } else {
      let full_str = "";
      while (i < chars.length - 1 && ![",", "(", ")"].includes(chars[i + 1])) {
        if (chars[i] !== ",") {
          full_str += chars[i];
        }
        i++;
      }
      if (chars[i] !== ",") {
        full_str += chars[i];
      }
      if(full_str !== ""){
        ret.push(full_str);
      }
    }
  }

  return ret;
}

function linearStringToTree(str: string): TreeNode {
  if (!str.startsWith("(")) {
    str = "(" + str;
  }
  if (!str.endsWith("(")) {
    str = str + ")";
  }
  const tokens = splitLinearString(str);
  const stack: string[] = [];
  const queue: TreeNode[] = [];
  const ret: TreeNode = {
    root: null,
    childLeft: null,
    childRight: null,
  };

  for (const token of tokens) {
    if (operatorsMap.has(token) && operatorsMap.get(token) === OPERATOR.CPP) {
      while (
        stack.length !== 0 &&
        operatorsMap.get(stack[stack.length - 1]) !== OPERATOR.OPP
      ) {
        const curr = stack.pop();
        if (!operatorsMap.has(curr)) {
          queue.unshift({
            root: curr,
            childLeft: null,
            childRight: null,
          });
        } else {
          const left = queue.length >= 1 ? queue.shift() : null;
          const right = queue.length >= 1 ? queue.shift() : null;
          queue.unshift({
            root: curr,
            childLeft: left,
            childRight: right,
          });
        }
      }
      if (stack.length !== 0) {
        stack.pop();
      } else {
        throw new Error(
          `ERROR :: linearStringToTree :: Malformed Formula -> ${str}`
        );
      }
    } else {
      stack.push(token);
    }
  }
  if (stack.length !== 0) {
    throw new Error(
      `ERROR :: linearStringToTree :: Malformed Formula -> ${str}`
    );
  }
  return queue.shift();
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

async function ParseTreeToGraphvizB64(tree : TreeNode) {
  let globalId = 0
  const stack : TreeNode[] = []
  const idStack : number[] = []
  let graphvizStr = `graph {
node[shape="box"]`
  stack.push(tree)
  idStack.push(globalId)

  while(stack.length !== 0) {
    const currNode = stack.pop()
    const currId = idStack.pop()
    graphvizStr += `\n${currId}[label="${currNode.root}"]\n`

    if(currNode.childLeft !== null) {
      globalId++
      stack.push(currNode.childLeft)
      idStack.push(globalId);
      graphvizStr += `${currId}--${globalId}\n`
    }
    if(currNode.childRight !== null) {
      globalId++
      stack.push(currNode.childRight)
      idStack.push(globalId);
      graphvizStr += `${currId}--${globalId}\n`
    }
  }
  
  graphvizStr += "\n}"

  const svg = await graphviz.dot(graphvizStr, 'svg')
  // Convert the SVG to Base64
  return Buffer.from(svg).toString('base64');
}

export async function generateLinearStringB64(linearString) {
  const tree = linearStringToTree(linearString)
  const ret = await ParseTreeToGraphvizB64(tree)
  return ret;
}