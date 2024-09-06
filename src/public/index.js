const img = document.querySelector("#img");
const btn = document.querySelector("#btn");
const input = document.querySelector("#input");

console.log(img);
console.log(input);
console.log(btn);

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
    img.src = `data:image/svg+xml;base64,${data.img}`
  } catch (error) {
    console.error("Error:", error);
  }
});
