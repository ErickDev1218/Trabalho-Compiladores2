enum OPERATOR {
    SUM,// SOMA
    SUB,// SUBTRACAO
    DIV,// DIVISAO
    MUL,// MULTIPLICACAO
    MEM,// LOAD
    MEV, // MOVEM
    MOV,// STORE
    OPP,// (
    CPP // )
}

const operatorsMap: Map<string, OPERATOR> = new Map<string, OPERATOR>([
    ["+", OPERATOR.SUM],
    ["-", OPERATOR.SUB],
    ["/", OPERATOR.DIV],
    ["*", OPERATOR.MUL],
    ["MEM", OPERATOR.MEM],
    ["MOV", OPERATOR.MOV],
    ["(", OPERATOR.OPP],
    [")", OPERATOR.CPP]
])

// Fica subetendido que o que nao é operador é operando.

type TreeNode = {
    root: string
    childLeft?: TreeNode 
    childRight?: TreeNode
} | null

function splitLinearString(str: string) : string[] {
    const chars : string[] = str.split("")
    const ret : string[] = [];

    for(let i = 0; i < chars.length; i++) {
        if(operatorsMap.has(chars[i])) {
            ret.push(chars[i]) 
        } else {
            let full_str = ""
            while(i < chars.length-1 && ![",", "(", ")"].includes(chars[i+1])) {
                if(chars[i] !== ","){
                    full_str += chars[i]
                }
                i++;
            }
            full_str += chars[i]
            ret.push(full_str)
        }
    }

    console.log(ret)

    return ret
}

function linearStringToTree(str: string): TreeNode {
    if(!str.startsWith("(")) {
        str = "(" + str
    }
    if(!str.endsWith("(")) {
        str = str + ")"
    }
    const tokens = splitLinearString(str);
    const stack : string[] = []
    const queue : TreeNode[] = []
    const ret : TreeNode = {
        root: null,
        childLeft: null,
        childRight: null
    }

    for(const token of tokens) {
        if(operatorsMap.has(token) && operatorsMap.get(token) === OPERATOR.CPP) {
            while(stack.length !== 0 && operatorsMap.get(stack[stack.length-1]) !== OPERATOR.OPP) {
                const curr = stack.pop()
                console.log(curr)
                if(!operatorsMap.has(curr)) {
                    queue.unshift({
                        root: curr,
                        childLeft: null,
                        childRight: null
                    })
                } else {
                    const left = queue.length >= 1 ? queue.shift() : null;
                    const right = queue.length >= 1 ? queue.shift() : null;
                    queue.unshift({
                        root: curr,
                        childLeft: left,
                        childRight: right
                    })
                }
            }
            if(stack.length !== 0) {
                stack.pop()
            } else {
                throw new Error(`ERROR :: linearStringToTree :: Malformed Formula -> ${str}`);
            }
        } else {
            stack.push(token)
        }
    }
    if(stack.length !== 0) {
        throw new Error(`ERROR :: linearStringToTree :: Malformed Formula -> ${str}`);
    }
    return queue.shift() 
}

function main() {
    let x = 'MEM(+(CONST 1,CONST 2))'

    console.log(linearStringToTree(x))
}

main()