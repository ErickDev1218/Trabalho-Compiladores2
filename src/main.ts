import { ParseTreeToGraphvizB64, stringToTree } from "./TreeNode.js";
import { selectInstrunctions } from "./InstructionSelection.js";

export async function generateLinearStringB64(linearString) {
  const tree = stringToTree(linearString)
  selectInstrunctions(tree)
  console.log(tree)
  // tree.posOrdemPrint()
  const ret = await ParseTreeToGraphvizB64(tree)
  return ret;
}

export function getTreeCost(linearString) {
  const tree = stringToTree(linearString)
  selectInstrunctions(tree)
  return tree.getCost();
}