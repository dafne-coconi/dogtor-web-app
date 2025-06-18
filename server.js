const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Base de datos simple (en un caso real, usa MongoDB/PostgreSQL)
const DB_FILE = path.join(__dirname, 'database.json');

// Diagnósticos predefinidos
const petDiagnostics = {
    perro: {
        "fiebre, vómitos": {
            diagnosis: "Gastroenteritis o Parvovirus",
            advice: "Llevar al veterinario urgentemente y mantener hidratación."
        },
        "tos, decaimiento": {
            diagnosis: "Tos de las perreras o Infección respiratoria",
            advice: "Consulta veterinaria y aislamiento de otras mascotas."
        }
    },
    gato: {
        "estornudos, legañas": {
            diagnosis: "Gripe felina (Herpesvirus o Calicivirus)",
            advice: "Visita al veterinario y limpia sus ojos con suero fisiológico."
        },
        "pérdida de peso, sed excesiva": {
            diagnosis: "Posible diabetes o enfermedad renal",
            advice: "Análisis de sangre urgentes."
        }
    }
};

/*app.post('/diagnose', (req, res) => {
    const { petType, symptoms } = req.body;
   // const symptomKey = symptoms.join(', ').toLowerCase();

    let diagnosis = "No se pudo determinar la enfermedad.";
    let advice = "Consulta a un veterinario para un diagnóstico preciso.";

    // Buscar coincidencias en los diagnósticos predefinidos
    if (petDiagnostics[petType]) {
        for (const [key, value] of Object.entries(petDiagnostics[petType])) {
            if (symptomKey.includes(key)) {
                diagnosis = value.diagnosis;
                advice = value.advice;
                break;
            }
        }
    }

    res.json({ diagnosis, advice });
});
*/

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
      {
        messages: [
          { role: "system", content: "Eres un asistente que responde preguntas sobre salud de mascotas. Das un diagnóstico y recomendaciones, pero al final siempre recomiendas asistir al veterinario" },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al contactar Azure OpenAI." });
  }
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});