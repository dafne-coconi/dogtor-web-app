const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

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

app.post('/diagnose', (req, res) => {
    const { petType, symptoms } = req.body;
    const symptomKey = symptoms.join(', ').toLowerCase();

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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});