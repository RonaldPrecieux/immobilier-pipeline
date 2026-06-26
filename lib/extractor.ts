import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { EXTRACT_PROMPT } from "@/prompts/extract";

export interface LeadData {
  prospect_nom: string | null;
  prospect_email: string | null;
  prospect_tel: string | null;
  bien_reference: string | null;
  bien_adresse: string | null;
  type_demande: "visite" | "info" | "candidature" | "autre" | null;
  langue: "fr" | "nl" | "en" | null;
  message_prospect: string | null;
  score_confiance: number;
}

const FALLBACK: LeadData = {
  prospect_nom: null,
  prospect_email: null,
  prospect_tel: null,
  bien_reference: null,
  bien_adresse: null,
  type_demande: null,
  langue: null,
  message_prospect: null,
  score_confiance: 0.0,
};

export async function extractLead(rawEmail: string): Promise<LeadData> {
  const prompt = EXTRACT_PROMPT.replace("{EMAIL}", rawEmail);

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0,
    });

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) throw new Error("Pas de JSON dans la réponse");

    const data = JSON.parse(text.slice(start, end)) as Partial<LeadData>;

    return {
      ...FALLBACK,
      ...data,
      score_confiance: Math.min(1, Math.max(0, Number(data.score_confiance ?? 0))),
    };
  } catch (err) {
    console.error("[extractor] erreur:", err);
    return FALLBACK;
  }
}
