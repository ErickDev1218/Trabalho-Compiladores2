export function printLine(lineLen = 40) {
    console.log("-".repeat(lineLen))
}

export function randomHexColor() {
  // Gera um número aleatório entre 0 e 16777215 (0xFFFFFF)
  const corAleatoria = Math.floor(Math.random() * 16777215);
  
  // Converte o número para hexadecimal e garante que tenha 6 dígitos
  const corHexadecimal = `#${corAleatoria.toString(16).padStart(6, '0')}`;
  
  return corHexadecimal;
}