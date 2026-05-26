import OpenAI from "openai";
import {
  extractionResultSchema,
  visionResultSchema,
  type ExtractionResult,
  type VisionResult,
} from "@motocheck/types";
import { buildExtractionPrompt, VISION_PROMPT } from "./prompts.js";

const visionCache = new Map<string, VisionResult>();

function parseJsonFromModel<T>(
  raw: string,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T } },
): T {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const parsed: unknown = JSON.parse(cleaned);
  const result = schema.safeParse(parsed);
  if (!result.success || result.data === undefined) {
    throw new Error("Invalid AI response schema");
  }
  return result.data;
}

export class AiService {
  private client: OpenAI | null;

  constructor(apiKey?: string) {
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async transcribeAudio(buffer: Buffer, mimeType: string): Promise<string> {
    if (!this.client) {
      return "entrega particular 25 reais";
    }
    const file = new File([buffer], "audio.ogg", { type: mimeType });
    const response = await this.client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "pt",
    });
    return response.text;
  }

  async extractFromText(text: string): Promise<ExtractionResult> {
    if (!this.client) {
      const lower = text.toLowerCase();
      if (
        /abastec|gasolina|posto|litro|litros|combustível|combustivel/.test(
          lower,
        )
      ) {
        const amount = Number(lower.match(/(\d+([.,]\d+)?)\s*(reais|r\$|pila|conto)?/)?.[1]?.replace(",", ".")) || 40;
        const liters = Number(lower.match(/(\d+([.,]\d+)?)\s*(l|litro|litros)/)?.[1]?.replace(",", ".")) || amount / 6;
        return {
          type: "fuel_refuel",
          totalAmount: amount,
          liters,
          confidence: 0.6,
        };
      }
      if (/painel|hodômetro|hodometro|km na moto|quilometr/.test(lower)) {
        const km = Number(lower.match(/(\d{4,6}([.,]\d)?)/)?.[1]?.replace(",", ".")) || 45000;
        return { type: "odometer", odometerKm: km, confidence: 0.6 };
      }
      return {
        type: "delivery",
        source: "PARTICULAR",
        grossValue: 25,
        originName: null,
        destinationAddr: null,
        distanceKm: null,
        confidence: 0.5,
      };
    }
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildExtractionPrompt(text) }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content ?? "{}";
    return parseJsonFromModel(content, extractionResultSchema);
  }

  async analyzeImage(
    imageUrl: string,
    cacheKey?: string,
  ): Promise<VisionResult> {
    if (cacheKey && visionCache.has(cacheKey)) {
      return visionCache.get(cacheKey)!;
    }
    if (!this.client) {
      return {
        type: "delivery_data",
        grossValue: 20,
        originName: null,
        destinationAddr: null,
      };
    }
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });
    const content = response.choices[0]?.message?.content ?? '{"type":"unknown"}';
    const result = parseJsonFromModel(content, visionResultSchema);
    if (cacheKey) {
      visionCache.set(cacheKey, result);
    }
    return result;
  }
}

export { buildExtractionPrompt, VISION_PROMPT };
