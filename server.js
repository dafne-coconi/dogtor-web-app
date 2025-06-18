const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;


const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openaiKey = process.env.AZURE_OPENAI_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
const indexName = process.env.AZURE_SEARCH_INDEX;
const searchApiKey = process.env.AZURE_SEARCH_API;

app.use(express.json());
app.use(express.static('public'));

// Base de datos simple (en un caso real, usa MongoDB/PostgreSQL)
const DB_FILE = path.join(__dirname, 'database.json');

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      `${openaiEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        messages: [
          { role: "system", content: "Eres un asistente que responde preguntas sobre salud de mascotas. Das un diagnóstico y recomendaciones, pero al final siempre recomiendas asistir al veterinario" },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500,
        data_sources: [
            {
                type: "azure_search",
                parameters: {
                    endpoint: searchEndpoint,
                    index_name: indexName,
                    semantic_configuration: "default",
                    query_type: "semantic",
                    fields_mapping: {},
                    in_scope: true,
                    filter: null,
                    strictness: 3,
                    top_n_documents: 5,
                    authentication: {
                      type: "api_key",
                      key: searchApiKey

                    }
                }
            }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": openaiKey
        }
      }
    );
    var respuesta = response.data.choices[0].message.content
    //console.log(respuesta)
    res.json({respuesta}
    );
  } catch (error) {
    console.error("Error:", error.response?.data || error);
    res.status(500).json({ error: "Error al contactar Azure OpenAI." });
  }
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});