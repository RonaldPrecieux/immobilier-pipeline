import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractLead } from "@/lib/extractor";
import { generateDraft } from "@/lib/draft";

const ALLOWED_SENDERS = new Set(
  (process.env.ALLOWED_SENDERS ?? "").split(",").map((s) => s.trim().toLowerCase())
);

export async function POST(req: NextRequest) {
  // sécurisation basique de la route
  const secret = req.headers.get("x-pipeline-secret");
  if (secret !== process.env.PROCESS_EMAIL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { raw_email: string; sender: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { raw_email, sender } = body;

  if (!raw_email) {
    return NextResponse.json({ error: "raw_email manquant" }, { status: 400 });
  }

  if (sender && !ALLOWED_SENDERS.has(sender.toLowerCase())) {
    return NextResponse.json({ error: "Expéditeur non autorisé" }, { status: 403 });
  }

  const lead = await extractLead(raw_email);

  if (lead.score_confiance < 0.3) {
    console.warn(`[pipeline] email incomplet — score=${lead.score_confiance}`, { sender });
  }

  const draft = await generateDraft(lead);

  try {
    const saved = await prisma.lead.create({
      data: {
        prospectNom: lead.prospect_nom,
        prospectEmail: lead.prospect_email,
        prospectTel: lead.prospect_tel,
        bienReference: lead.bien_reference,
        bienAdresse: lead.bien_adresse,
        typeDemande: lead.type_demande,
        langue: lead.langue,
        messageProspect: lead.message_prospect,
        scoreConfiance: lead.score_confiance,
        draftReponse: draft,
        rawEmail: raw_email,
      },
    });

    return NextResponse.json({ success: true, id: saved.id, lead, draft });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique_lead_per_day") || msg.includes("Unique constraint")) {
      return NextResponse.json({ success: false, reason: "doublon" }, { status: 200 });
    }
    console.error("[pipeline] erreur DB:", msg);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
