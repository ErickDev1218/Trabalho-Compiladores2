export function printLine(lineLen = 40) {
    console.log("-".repeat(lineLen))
}

export function randomHexColor() {
  const corAleatoria = Math.floor(Math.random() * 16777215);
  
  const corHexadecimal = `#${corAleatoria.toString(16).padStart(6, '0')}`;
  
  return corHexadecimal;
}