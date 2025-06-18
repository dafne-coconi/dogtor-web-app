document.getElementById("diagnosticForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = document.getElementById("symptoms").value;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      document.getElementById("result").innerText = data.reply;
    });