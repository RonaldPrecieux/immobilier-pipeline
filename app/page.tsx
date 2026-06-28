"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Animation helpers ─────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Typing mockup ──────────────────────────────────────── */
const JSON_LINES = [
  '  "prospect_nom":    "Sophie Marchal",',
  '  "prospect_email":  "sophie@gmail.com",',
  '  "prospect_tel":    "+32 476 88 21 34",',
  '  "bien_reference":  "IW-2847392",',
  '  "bien_adresse":    "Rue du Pont d\'Ile 12, Liège",',
  '  "type_demande":    "visite",',
  '  "langue":          "fr",',
  '  "score_confiance": 0.97',
];

function TypingMockup() {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisibleLines(i);
      if (i >= JSON_LINES.length) clearInterval(interval);
    }, 180);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative rounded-xl border overflow-hidden"
      style={{
        background: "rgba(17,17,17,0.9)",
        borderColor: "rgba(99,102,241,0.25)",
        boxShadow:
          "0 0 0 1px rgba(99,102,241,0.1), 0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)",
      }}
    >
      {/* window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span
          className="ml-3 text-xs font-mono"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          lead.json
        </span>
      </div>

      {/* code */}
      <pre
        className="text-sm font-mono px-6 py-5 leading-7"
        style={{ color: "#e2e8f0", minHeight: "260px" }}
      >
        <span style={{ color: "rgba(255,255,255,0.25)" }}>{"{"}</span>
        {"\n"}
        {JSON_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            {i === JSON_LINES.length - 1 ? (
              <span style={{ color: "#a5b4fc" }}>{line}</span>
            ) : (
              <>
                <span style={{ color: "#94a3b8" }}>
                  {line.split(":")[0]}:
                </span>
                <span style={{ color: "#6ee7b7" }}>
                  {line.split(":").slice(1).join(":")}
                </span>
              </>
            )}
          </motion.span>
        ))}
        {visibleLines < JSON_LINES.length && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ color: "#6366f1" }}
          >
            |
          </motion.span>
        )}
        {"\n"}
        <span style={{ color: "rgba(255,255,255,0.25)" }}>{"}"}</span>
      </pre>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(10,10,10,0)", "rgba(10,10,10,0.85)"]
  );
  const border = useTransform(
    scrollY,
    [0, 60],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed top-0 inset-x-0 z-50 border-b backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            P
          </div>
          <span className="font-semibold text-white tracking-tight">
            Pipeline
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
            style={{
              color: "#a5b4fc",
              borderColor: "rgba(99,102,241,0.35)",
              background: "rgba(99,102,241,0.08)",
            }}
          >
            BETA
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
          }
        >
          Dashboard
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.nav>
  );
}

/* ─── Feature card ───────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <FadeUp delay={delay}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl p-6 h-full"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          {desc}
        </p>
      </motion.div>
    </FadeUp>
  );
}

/* ─── Step ───────────────────────────────────────────────── */
function Step({
  n,
  title,
  desc,
  delay,
}: {
  n: number;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <FadeUp delay={delay} className="flex gap-5">
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: "rgba(99,102,241,0.15)",
            color: "#818cf8",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          {n}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          {desc}
        </p>
      </div>
    </FadeUp>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        {/* grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 py-24 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#a5b4fc",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              />
              Automatisation immobilière par IA
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-white mb-6"
            >
              Vos leads Immoweb&nbsp;&amp;&nbsp;Immovlan,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #818cf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                traités en&nbsp;60&nbsp;s
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed mb-10"
              style={{ color: "#94a3b8" }}
            >
              Le pipeline surveille votre boîte mail, extrait chaque demande
              entrante, qualifie le lead et génère un brouillon de réponse
              adapté — automatiquement, 24h/24.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(99,102,241,0.4), 0 8px 32px rgba(99,102,241,0.3)",
                  }}
                >
                  Commencer
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>

              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  Voir le dashboard
                </motion.button>
              </Link>
            </motion.div>

            {/* social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {["S", "T", "L", "K"].map((l, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 text-white"
                    style={{
                      background: `hsl(${240 + i * 30}, 60%, 45%)`,
                      borderColor: "#0a0a0a",
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>
                <span className="text-white font-medium">4 agences</span> déjà
                connectées
              </p>
            </motion.div>
          </div>

          {/* right — JSON mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <TypingMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-28 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <FadeUp className="text-center mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#6366f1" }}
            >
              Fonctionnalités
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tout automatisé, rien à gérer
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
              De la réception de l'email à la réponse prête à envoyer, le
              pipeline gère chaque étape sans intervention.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              delay={0.05}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Détection automatique"
              desc="Le poller surveille votre Gmail toutes les 60 secondes et capture chaque email provenant d'Immoweb ou Immovlan."
            />
            <FeatureCard
              delay={0.12}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Extraction IA"
              desc="GPT-4 analyse le texte brut et extrait le nom, email, téléphone, référence du bien, type de demande et langue détectée."
            />
            <FeatureCard
              delay={0.19}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              title="Brouillon instantané"
              desc="Un draft de réponse est généré automatiquement, adapté à la langue du prospect et au type de demande (visite, info, candidature)."
            />
          </div>

          {/* secondary features */}
          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <FeatureCard
              delay={0.26}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.045-.14-2.06-.382-3.016z" />
                </svg>
              }
              title="Anti-doublons intégré"
              desc="Même email + même bien + même jour = une seule entrée. La contrainte est vérifiée en base, sans logique applicative fragile."
            />
            <FeatureCard
              delay={0.33}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Score de confiance"
              desc="Chaque lead reçoit un score de 0 à 1. Les emails incomplets ou ambigus sont signalés automatiquement sans bloquer le pipeline."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <FadeUp>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "#6366f1" }}
                >
                  Comment ça marche
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  De l'email au lead qualifié en 4 étapes
                </h2>
                <p className="text-base mb-12" style={{ color: "#64748b" }}>
                  Une architecture simple et robuste, sans dépendance fragile.
                </p>
              </FadeUp>

              <div className="flex flex-col gap-8">
                <Step
                  n={1}
                  delay={0.05}
                  title="Email reçu sur Gmail"
                  desc="Immoweb ou Immovlan envoie un email de contact. Le poller tourne en arrière-plan et le détecte dans les 60 secondes."
                />
                <Step
                  n={2}
                  delay={0.12}
                  title="Vérification de l'expéditeur"
                  desc="Seuls les emails des portails autorisés passent. Les autres sont ignorés silencieusement sans consommer de tokens."
                />
                <Step
                  n={3}
                  delay={0.19}
                  title="Extraction IA du contenu"
                  desc="Le texte brut est envoyé à GPT-4. Le modèle retourne un JSON structuré avec tous les champs et un score de confiance."
                />
                <Step
                  n={4}
                  delay={0.26}
                  title="Sauvegarde + brouillon"
                  desc="Le lead est enregistré dans Supabase et un brouillon de réponse est généré, prêt à être envoyé depuis le dashboard."
                />
              </div>
            </div>

            {/* visual connector */}
            <FadeUp delay={0.15} className="hidden lg:block">
              <div
                className="rounded-2xl p-8"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  {
                    icon: "📧",
                    label: "Gmail",
                    sub: "noreply@immoweb.be",
                    color: "#ef4444",
                  },
                  {
                    icon: "🔍",
                    label: "Poller",
                    sub: "Python · Render",
                    color: "#f59e0b",
                  },
                  {
                    icon: "🤖",
                    label: "GPT-4o-mini",
                    sub: "Extraction JSON",
                    color: "#6366f1",
                  },
                  {
                    icon: "🗄️",
                    label: "Supabase",
                    sub: "PostgreSQL · leads",
                    color: "#10b981",
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12, duration: 0.5 }}
                      className="flex items-center gap-4 py-4"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${item.color}18` }}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">
                          {item.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#475569" }}
                        >
                          {item.sub}
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: item.color }}
                      />
                    </motion.div>
                    {i < 3 && (
                      <div
                        className="ml-5 w-px h-5"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeUp>
            <div
              className="rounded-2xl p-12 relative overflow-hidden"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Prêt à automatiser votre pipeline ?
                </h2>
                <p className="mb-8" style={{ color: "#94a3b8" }}>
                  Connectez votre boîte mail et laissez l'IA traiter vos leads
                  à votre place.
                </p>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      boxShadow:
                        "0 0 0 1px rgba(99,102,241,0.4), 0 12px 40px rgba(99,102,241,0.35)",
                    }}
                  >
                    Commencer maintenant
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        className="py-10 border-t text-center text-xs"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          color: "#334155",
        }}
      >
        Pipeline Immobilier — Automatisation IA des leads belges · Immoweb ·
        Immovlan
      </footer>
    </div>
  );
}
