export const EXTRACT_PROMPT = `Tu es un assistant spécialisé dans le traitement d'emails immobiliers belges.

Analyse l'email brut ci-dessous et retourne UNIQUEMENT un objet JSON valide, sans texte avant ni après.

Règles strictes :
- Tous les champs doivent être présents dans la réponse
- Si une information est absente ou incertaine, utilise null
- type_demande : "visite" si demande de visite, "info" si questions, "candidature" si dossier locataire, "autre" sinon
- langue : "fr" si français, "nl" si néerlandais, "en" si anglais
- prospect_email : email du PROSPECT (la personne intéressée par le bien), jamais l'adresse expéditrice automatique (noreply@, notifications@, no-reply@)
- score_confiance : float entre 0.0 et 1.0
  - 0.9-1.0 : toutes les infos clés présentes et cohérentes (nom, email prospect, référence, adresse)
  - 0.5-0.8 : infos partielles mais email globalement lisible
  - 0.0-0.3 : email incomplet, tronqué, corrompu ou données insuffisantes pour qualifier le lead

Format de sortie attendu :
{
  "prospect_nom": string | null,
  "prospect_email": string | null,
  "prospect_tel": string | null,
  "bien_reference": string | null,
  "bien_adresse": string | null,
  "type_demande": "visite" | "info" | "candidature" | "autre" | null,
  "langue": "fr" | "nl" | "en" | null,
  "message_prospect": string | null,
  "score_confiance": float
}

Email à analyser :
---
{EMAIL}
---`;
