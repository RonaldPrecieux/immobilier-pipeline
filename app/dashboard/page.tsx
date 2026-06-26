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

interface Health {
  db: "ok" | "error";
  latency_ms?: number;
  pooler?: string;
  message?: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  visite:      { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  info:        { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  candidature: { bg: "bg-emerald-100",text: "text-emerald-700",dot: "bg-emerald-500" },
  autre:       { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400" },
};

const LANG_FLAG: Record<string, string> = { fr: "🇫🇷", nl: "🇧🇪", en: "🇬🇧" };

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 0.8 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : score >= 0.4 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-500 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-semibold ${color}`}>
      {score.toFixed(2)}
    </span>
  );
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = () => {
    Promise.all([
      fetch("/api/leads").then(r => r.json()),
      fetch("/api/health").then(r => r.json()),
    ]).then(([l, h]) => {
      setLeads(l);
      setHealth(h);
      setLoading(false);
      setLastUpdated(new Date());
    });
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toDateString();
  const todayCount = leads.filter(l => new Date(l.createdAt).toDateString() === today).length;
  const avgScore = leads.length ? (leads.reduce((s, l) => s + l.scoreConfiance, 0) / leads.length) : 0;
  const lowScore = leads.filter(l => l.scoreConfiance < 0.3).length;

  const filtered = leads.filter(l => {
    if (filterType && l.typeDemande !== filterType) return false;
    if (filterLang && l.langue !== filterLang) return false;
    if (l.scoreConfiance < minScore) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pipeline Immobilier</h1>
          <p className="text-sm text-slate-500">Leads Immoweb & Immovlan</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Mis à jour à {lastUpdated.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button onClick={refresh} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            ↻ Actualiser
          </button>
          {/* Statut pooler */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
            health === null ? "bg-slate-100 text-slate-500 border-slate-200"
            : health.db === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              health === null ? "bg-slate-400"
              : health.db === "ok" ? "bg-emerald-500 animate-pulse"
              : "bg-red-500"
            }`} />
            {health === null ? "Vérification..."
              : health.db === "ok" ? `Pooler actif · ${health.latency_ms}ms`
              : "Pooler hors ligne"}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Métriques */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total leads", value: leads.length, color: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
            { label: "Aujourd'hui", value: todayCount, color: "border-l-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
            { label: "Score moyen", value: avgScore.toFixed(2), color: "border-l-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
            { label: "Incomplets", value: lowScore, color: "border-l-red-400", bg: "bg-red-50", text: "text-red-600" },
          ].map(m => (
            <div key={m.label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${m.color} p-4`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</p>
              <p className={`text-3xl font-bold mt-1 ${m.text}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-slate-600">Filtres :</span>
          <div className="flex gap-2 flex-wrap">
            {["", "visite", "info", "candidature", "autre"].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  filterType === t
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {t || "Tous"}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex gap-2">
            {["", "fr", "nl", "en"].map(l => (
              <button key={l} onClick={() => setFilterLang(l)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  filterLang === l
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {l ? `${LANG_FLAG[l]} ${l.toUpperCase()}` : "Toutes"}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Score min :</span>
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white">
              {[0, 0.3, 0.5, 0.8].map(v => (
                <option key={v} value={v}>{v === 0 ? "Tous" : `≥ ${v}`}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Tableau */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Prospect", "Bien", "Type", "Langue", "Score", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => {
                    const style = TYPE_STYLES[lead.typeDemande ?? "autre"] ?? TYPE_STYLES.autre;
                    return (
                      <tr key={lead.id} onClick={() => setSelected(lead)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          selected?.id === lead.id ? "bg-blue-50" : i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100"
                        }`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{lead.prospectNom ?? "—"}</p>
                          <p className="text-xs text-slate-400">{lead.prospectEmail ?? ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700 max-w-[180px] truncate">{lead.bienAdresse ?? "—"}</p>
                          <p className="text-xs text-slate-400 font-mono">{lead.bienReference ?? ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          {lead.typeDemande && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {lead.typeDemande}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-lg">{LANG_FLAG[lead.langue ?? ""] ?? "—"}</td>
                        <td className="px-4 py-3"><ScoreBadge score={lead.scoreConfiance} /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(lead.createdAt).toLocaleString("fr-BE", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Aucun lead</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Panneau détail */}
          {selected && (
            <div className="w-80 shrink-0 space-y-3 self-start sticky top-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{selected.prospectNom ?? "Inconnu"}</p>
                    <p className="text-xs text-slate-500">{selected.prospectEmail}</p>
                    <p className="text-xs text-slate-500">{selected.prospectTel}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600 text-lg leading-none">✕</button>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="font-medium text-slate-800 text-sm">{selected.bienAdresse ?? "—"}</p>
                  <p className="text-xs text-slate-400 font-mono">{selected.bienReference}</p>
                </div>
                <div className="flex gap-2">
                  {selected.typeDemande && (() => {
                    const s = TYPE_STYLES[selected.typeDemande] ?? TYPE_STYLES.autre;
                    return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.bg} ${s.text}`}>{selected.typeDemande}</span>;
                  })()}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{LANG_FLAG[selected.langue ?? ""]} {selected.langue?.toUpperCase()}</span>
                  <ScoreBadge score={selected.scoreConfiance} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.messageProspect ?? "—"}</p>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Brouillon de réponse</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.draftReponse ?? "—"}</p>
              </div>

              <details className="bg-white rounded-xl border border-slate-200 p-4 text-xs">
                <summary className="cursor-pointer text-slate-400 font-medium">Email brut</summary>
                <pre className="mt-2 text-slate-500 overflow-auto max-h-48 whitespace-pre-wrap">{selected.rawEmail}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
