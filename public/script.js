document.getElementById('diagnosticForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const petType = document.getElementById('petType').value;
    const symptoms = document.getElementById('symptoms').value.split(',').map(s => s.trim());
    
    try {
        const response = await fetch('/diagnose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petType, symptoms })
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('result');
        
        resultDiv.innerHTML = `
            <h3>Diagnóstico para ${petType}:</h3>
            <p><strong>Síntomas:</strong> ${symptoms.join(', ')}</p>
            <p><strong>Posible enfermedad:</strong> ${data.diagnosis}</p>
            <p><strong>Recomendación:</strong> ${data.advice}</p>
        `;
        resultDiv.style.display = 'block';
    } catch (error) {
        alert("Error al obtener el diagnóstico");
    }
});