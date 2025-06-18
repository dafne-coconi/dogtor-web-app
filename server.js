const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const { checkJwt, checkGroup } = require("./auth");

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

const historial = {}; // Historial de conversaciones simple en memoria

const GROUPS = {
  DUENIOS: process.env.GROUP_OWN_ID,
  VETERINARIOS: process.env.GROUP_VET_ID,
  ADMIN: process.env.GROUP_ADMIN_ID
};

// Rutas protegidas
app.get("/dueno", checkJwt, checkGroup(GROUPS.DUENIOS), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/vet", checkJwt, checkGroup(GROUPS.VETERINARIOS), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vet.html"));
});

app.get("/admin", checkJwt, checkGroup(GROUPS.ADMIN), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});


app.post("/api/chat", async (req, res) => {
  const userId = req.auth.preferred_username;
  const userMessage = req.body.message;

  try {
    if (!historial[userId]) historial[userId] = [];
    historial[userId].push({ role: "user", content: userMessage });

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
    historial[userId].push({ role: "assistant", content: respuesta });
    //console.log(respuesta)
    res.json({respuesta}
    );
  } catch (error) {
    console.error("Error:", error.response?.data || error);
    res.status(500).json({ error: "Error al contactar Azure OpenAI." });
  }
});

// Obtener historial del usuario autenticado
app.get("/api/mihistorial", checkJwt, checkGroup(GROUPS.DUENIOS), (req, res) => {
  const userId = req.auth.preferred_username;
  res.json(historial[userId] || []);
});

// Obtener todo el historial (vet y admin)
app.get("/api/historial", checkJwt, (req, res) => {
  const groups = req.auth.groups || [];
  if (groups.includes(GROUPS.VETERINARIOS) || groups.includes(GROUPS.ADMIN)) {
    res.json(historial);
  } else {
    res.status(403).send("No autorizado");
  }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});