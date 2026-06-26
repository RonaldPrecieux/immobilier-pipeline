"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  createdAt: string;
  prospectNom: string | null;
  prospectEmail: string | null;
  prospectTel: string | null;
  bienReference: string | null;
  bienAdresse: string | null;
  typeDemande: string | null;
  langue: string | null;
  scoreConfiance: number;
  messageProspect: string | null;
  draftReponse: string | null;
  rawEmail: string;
}

const TYPE_COLORS: Record<string, string> = {
  visite: "bg-blue-100 text-blue-800",
  info: "bg-yellow-100 text-yellow-800",
  candidature: "bg-green-100 text-green-800",
  autre: "bg-gray-100 text-gray-800",
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads);
  }, []);

  const today = new Date().toDateString();
  const todayCount = leads.filter((l) => new Date(l.createdAt).toDateString() === today).length;
  const avgScore = leads.length ? (leads.reduce((s, l) => s + l.scoreConfiance, 0) / leads.length).toFixed(2) : "—";
  const lowScore = leads.filter((l) => l.scoreConfiance < 0.3).length;

  const filtered = leads.filter((l) => {
    if (filterType && l.typeDemande !== filterType) return false;
    if (filterLang && l.langue !== filterLang) return false;
    if (l.scoreConfiance < minScore) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pipeline Immobilier — Leads</h1>

      {/* métriques */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total leads", value: leads.length },
          { label: "Aujourd'hui", value: todayCount },
          { label: "Score moyen", value: avgScore },
          { label: "Score < 0.3", value: lowScore },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className="text-3xl font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* filtres */}
      <div className="flex gap-4 mb-4">
        <select className="border rounded px-3 py-1.5 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tous types</option>
          {["visite", "info", "candidature", "autre"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="border rounded px-3 py-1.5 text-sm" value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
          <option value="">Toutes langues</option>
          {["fr", "nl", "en"].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm">
          <label>Score min :</label>
          <input type="range" min={0} max={1} step={0.05} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-32" />
          <span>{minScore.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* tableau */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Nom", "Email", "Référence", "Adresse", "Type", "Langue", "Score", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className={`border-b cursor-pointer hover:bg-gray-50 ${selected?.id === lead.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">{lead.prospectNom ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.prospectEmail ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.bienReference ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{lead.bienAdresse ?? "—"}</td>
                  <td className="px-4 py-3">
                    {lead.typeDemande && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[lead.typeDemande] ?? TYPE_COLORS.autre}`}>
                        {lead.typeDemande}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 uppercase text-xs font-mono">{lead.langue ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono ${lead.scoreConfiance < 0.3 ? "text-red-600" : lead.scoreConfiance > 0.8 ? "text-green-600" : "text-yellow-600"}`}>
                      {lead.scoreConfiance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(lead.createdAt).toLocaleString("fr-BE")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Aucun lead</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* panneau détail */}
        {selected && (
          <div className="w-96 bg-white rounded-lg shadow-sm border p-4 space-y-4 self-start sticky top-6">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-gray-900">{selected.prospectNom ?? "Inconnu"}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="text-sm space-y-1 text-gray-600">
              <p>{selected.prospectEmail}</p>
              <p>{selected.prospectTel}</p>
              <p className="font-medium text-gray-900">{selected.bienAdresse}</p>
              <p className="text-xs text-gray-400">{selected.bienReference}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2">{selected.messageProspect ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Brouillon de réponse</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 rounded p-2">{selected.draftReponse ?? "—"}</p>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-400">Email brut</summary>
              <pre className="mt-2 bg-gray-50 rounded p-2 overflow-auto max-h-48 text-gray-600">{selected.rawEmail}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
