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
  // OPP, // (
  // CPP, // )
}

const operatorsMap: Map<string, [OPERATOR, number]> = new Map<string, [OPERATOR, number]>([
  ["+", [OPERATOR.SUM, 2]],
  ["-", [OPERATOR.SUB, 2]],
  ["/", [OPERATOR.DIV, 2]],
  ["*", [OPERATOR.MUL, 2]],
  ["MEV", [OPERATOR.MEV, 2]],
  ["MEM", [OPERATOR.MEM, 1]],
  ["MOV", [OPERATOR.MOV, 2]],
  // ["(", [ OPERATOR.OPP, 0]],
  // [")", [ OPERATOR.CPP, 0]],
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
      if (full_str !== "") {
        ret.push(full_str);
      }
    }
  }

  return ret;
}

// function linearStringToTree(str: string): TreeNode {
//   const tokens = splitLinearString(str);
//   console.log(tokens)
//   const stack: string[] = [];
//   const queue: TreeNode[] = [];
//   const ret: TreeNode = {
//     root: null,
//     childLeft: null,
//     childRight: null,
//   };

//   for (const token of tokens) {
//     if (operatorsMap.has(token)) {
//       if (operatorsMap.get(token) === OPERATOR.CPP) {
//         while (
//           stack.length !== 0 &&
//           operatorsMap.get(stack[stack.length - 1]) !== OPERATOR.OPP
//         ) {
//           const op = stack.pop();
//           const left = queue.length >= 1 ? queue.shift() : null;
//           const right = queue.length >= 1 && op !== "MEM" ? queue.shift() : null;
//           queue.unshift({
//             root: op,
//             childLeft: left,
//             childRight: right,
//           });
//         }
//         if (stack.length !== 0) {
//           stack.pop();
//         } else {
//           throw new Error(
//             `ERROR :: linearStringToTree :: Malformed Formula -> ${str}`
//           );
//         }
//       } else {
//         stack.push(token)
//       }
//     } else {
//       queue.unshift({
//         root: token,
//         childLeft: null,
//         childRight: null
//       })
//     }
//   } 

//   return queue.shift();
// }

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
  let graphvizStr = `graph {
node[shape="box"]`
  stack.push(tree)
  idStack.push(globalId)

  while (stack.length !== 0) {
    const currNode = stack.pop()
    const currId = idStack.pop()
    graphvizStr += `\n${currId}[label="${currNode.root}"]\n`

    if (currNode.childRight !== null) {
      globalId++
      stack.push(currNode.childRight)
      idStack.push(globalId);
      graphvizStr += `${currId}--${globalId}\n`
    }
    if (currNode.childLeft !== null) {
      globalId++
      stack.push(currNode.childLeft)
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
  console.log(tree)
  const ret = await ParseTreeToGraphvizB64(tree)
  return ret;
}


//Testando com recursão

function rec(str: string) {
  if (str.length === 0) {
    return null
  }
  let _str = ''
  let i = 0
  while (!str.includes('(')) {
    _str = str[i]
  }
  _str = _str.substring(0, _str.length - 1)
  const final: TreeNode = {
    root: _str,
    childLeft: rec(_str),
    childRight: rec(_str) //depois de remover até o proximo )
  }
}

function linearStringToTree(str: string): TreeNode {
  str = str.trim()
  const root = str.substring(0, str.indexOf("(") === -1 ? str.length : str.indexOf("("))
  console.log("str:", str)
  console.log("root:", root)
  if (!operatorsMap.has(root)) {
    return {
      root,
      childLeft: null,
      childRight: null
    }
  } else {
    let flag = false;
    let counter = 0;
    let index = 0;
    let left;
    let right;

    for (let i = 0; i < str.length; i++) {
      if (str[i] === "(") {
        counter++;
        if (!flag) {
          flag = true
        }
      }
      if (str[i] === ")") {
        counter--;
        if (counter === 1) {
          index = i;
          break;
        }
      }
    }

    if (counter === 0) {
      right = str.substring(str.indexOf("(") + 1, str.length - 1).split(",")[1]
      left = str.substring(str.indexOf("(") + 1, str.length - 1).split(",")[0]
    } else {
      left = (str.substring(str.indexOf("(") + 1, index + 1))
      let temp = str.substring(index + 1, str.length)
      right = temp.substring(temp.indexOf(",") + 1, temp.length - 1)
    }

    if (operatorsMap.get(root)[1] === 1) {
      return {
        root,
        childLeft: linearStringToTree(left),
        childRight: null
      }
    } else if (operatorsMap.get(root)[1] === 2) {
      return {
        root,
        childLeft: linearStringToTree(right),
        childRight: linearStringToTree(left)
      }
    }
  }
}