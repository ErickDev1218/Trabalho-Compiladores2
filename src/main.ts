import { ParseTreeToGraphvizB64, stringToTree } from "./TreeNode.js";
import { selectInstrunctions, translateInstrunctions } from "./InstructionSelection.js";

type treeInfo = {
  b64Tree: string
  costTree: number
  codeTree: string[]
}

export async function getTreeInfoFromLinearString(linearString : string) {
  const tree = stringToTree(linearString)
  selectInstrunctions(tree)
  // console.log(tree)
  // tree.posOrdemPrint()
  const b64Tree = await ParseTreeToGraphvizB64(tree)
  return {
    b64Tree,
    costTree: tree.getCost(),
    codeTree: translateInstrunctions(tree)
  }
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

export function getTranslateCode(linearString) {
  const tree = stringToTree(linearString)
  selectInstrunctions(tree)
  return translateInstrunctions(tree);
}