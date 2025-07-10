

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

// Declare the AI client, but do not initialize it immediately.
let ai: GoogleGenAI | null = null;

// Only attempt to initialize the AI client if an API key is provided.
// This prevents the application from crashing on startup if the key is missing.
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

export const generateIncidentAnalysis = async (description: string, suggestion: string): Promise<{ summary: string, steps: string[] } | null> => {
    // If the AI client was never initialized (no API key), return a default message.
    if (!ai) {
        return {
            summary: "Análisis por IA no disponible. API Key no configurada.",
            steps: ["Verificar la configuración de la API de Gemini."]
        };
    }

    const prompt = `
        Analiza la siguiente incidencia de un centro educativo a partir de su descripción y la sugerencia del usuario. Genera un resumen y los pasos a seguir.

        Descripción del problema: "${description}"
        Sugerencia del usuario: "${suggestion || 'Ninguna'}"
    `;

    try {
        // We can now safely use the `ai` client.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "Resumen de una sola frase de la incidencia."
                        },
                        actionable_steps: {
                            type: Type.ARRAY,
                            description: "Tres pasos de acción breves y claros para un técnico.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["summary", "actionable_steps"]
                }
            }
        });

        const parsedData = JSON.parse(response.text);
        
        return {
            summary: parsedData.summary || "No se pudo generar un resumen.",
            steps: parsedData.actionable_steps || ["No se pudieron generar los pasos a seguir."]
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            summary: "Error al contactar con el servicio de IA.",
            steps: ["Revisar la conexión y la configuración de la API.", "Intentar de nuevo más tarde."]
        };
    }
};