import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { LeadData } from "./extractor";

const TEMPLATES: Record<string, string> = {
  "visite-fr": "Bonjour {nom},\n\nMerci pour votre intérêt concernant le bien {adresse}.\nNous serions ravis de vous organiser une visite. Pourriez-vous confirmer vos disponibilités ?\n\nCordialement,",
  "visite-nl": "Goedemiddag {nom},\n\nBedankt voor uw interesse in {adresse}.\nWe organiseren graag een bezoek. Kunt u uw beschikbaarheid bevestigen?\n\nMet vriendelijke groeten,",
  "info-fr": "Bonjour {nom},\n\nMerci pour vos questions concernant {adresse}.\nNous allons y répondre dans les meilleurs délais.\n\nCordialement,",
  "info-nl": "Goedemiddag {nom},\n\nBedankt voor uw vragen over {adresse}.\nWe beantwoorden deze zo snel mogelijk.\n\nMet vriendelijke groeten,",
  "candidature-fr": "Bonjour {nom},\n\nNous avons bien reçu votre candidature pour le bien {adresse}.\nNous l'étudions et reviendrons vers vous rapidement.\n\nCordialement,",
  "candidature-nl": "Goedemiddag {nom},\n\nWe hebben uw kandidatuur voor {adresse} goed ontvangen.\nWe bekijken deze en komen spoedig bij u terug.\n\nMet vriendelijke groeten,",
};

export async function generateDraft(lead: LeadData): Promise<string> {
  const type = lead.type_demande ?? "autre";
  const langue = lead.langue ?? "fr";
  const nom = lead.prospect_nom ?? "Madame, Monsieur";
  const adresse = lead.bien_adresse ?? "notre bien";

  const key = `${type}-${langue}`;
  if (TEMPLATES[key]) {
    return TEMPLATES[key].replace("{nom}", nom).replace("{adresse}", adresse);
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Rédige une courte réponse professionnelle en ${langue} pour une demande de type "${type}" concernant le bien à ${adresse}. Adresse-toi à ${nom}. 3 phrases max, ton courtois d'agence immobilière belge.`,
      temperature: 0.3,
    });
    return text.trim();
  } catch {
    return "";
  }
}
