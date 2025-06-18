document.getElementById("diagnosticForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = document.getElementById("symptoms").value;
      try{
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
      console.log("After getting response")
      const data = await response.json();
      console.log("El data es", data)
      const resultDiv = document.getElementById('result');
      //document.getElementById("result").innerText = data.reply;
      resultDiv.innerHTML = `
            <h3>Diagnóstico para Perro</h3>
            <p><strong>Posible enfermedad:</strong> ${data.respuesta}</p>
        `;
      console.log("Después")
      resultDiv.style.display = 'block';
    } catch (error) {
        console.log(error)
        alert("Error al obtener diagnóstico")
    }
    });