const img = document.querySelector("#img");
const btn = document.querySelector("#btn");
const input = document.querySelector("#input");
const costDiv = document.querySelector("#cost-div")
const codeCard = document.querySelector("#code-card");

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
    img.src = `data:image/svg+xml;base64,${data.b64Tree}`
    costDiv.innerText = `Custo: ${data.costTree}`
    codeCard.innerText = data.codeTree.join("\n")
  } catch (error) {
    console.error("Error:", error);
  }
});
