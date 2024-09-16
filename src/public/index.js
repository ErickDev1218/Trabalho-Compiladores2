const img = document.querySelector("#img");
const btn = document.querySelector("#btn");
const input = document.querySelector("#input");
const costDiv = document.querySelector("#cost-div")
const codeCard = document.querySelector("#code-card");
const showDiv = document.querySelector('#dinamic')
const badFormat = document.querySelector('#badFormat')

btn.addEventListener("click", async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/linear-string-to-img/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linearString: input.value,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    // console.log("Success:", data);
    showDiv.classList.add('generateContainer')
    img.style.display = 'block'
    img.src = `data:image/svg+xml;base64,${data.b64Tree}`
    costDiv.innerText = `Custo: ${data.costTree}`
    codeCard.innerHTML = ''
    data.codeTree.forEach(ea => {
      codeCard.innerHTML += `<li> ${ea} </li>`
    })
    badFormat.innerText = ''
    // codeCard.innerText = data.codeTree.join("\n")
  } catch (error) {
    codeCard.innerHTML = ''
    img.src = ''
    img.style.display = 'none'
    costDiv.innerHTML = ''
    badFormat.innerText = 'Entrada fora do formato esperado!'
    showDiv.classList.remove('generateContainer')
    console.error("Error:", error);
  }
});
