document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const city = document.getElementById("city").value;

  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, city })
    });

    const message = await response.text();
    document.getElementById("message").textContent = message;
  } catch (error) {
    document.getElementById("message").textContent = "Erro ao conectar com o servidor.";
  }
});