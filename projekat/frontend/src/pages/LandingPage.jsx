import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from '../context/AuthContext';

/* ─── SVG Icons ─── */
const IconBriefcase = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IconUser = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSearch = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconMoon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IconSun = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const IconCheck = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l3 3 5-5" />
  </svg>
);
const IconBell = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconStar = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconFile = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconClipboard = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
const IconLayers = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const IconGlobe = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconSettings = ({ size = 22, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconArrowRight = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconCode = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconActivity = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconTrendingUp = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconCpu = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);
const IconPenTool = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

/* ══════════════════════════════════════
   CAROUSEL DATA
══════════════════════════════════════ */
const AREAS = [
  {
    Icon: IconCode,
    label: "Programiranje & IT",
    roles: ["Frontend Developer", "Backend Developer", "QA Engineer"],
    color: "#1a6fd4",
    bg: "linear-gradient(135deg,#ddeeff,#eaf3ff)",
    accent: "#1a6fd4",
    tag: "Najpopularnije",
  },
  {
    Icon: IconActivity,
    label: "Medicina & Zdravstvo",
    roles: ["Klinička praksa", "Farmacija", "Fizioterapija"],
    color: "#0e9e6e",
    bg: "linear-gradient(135deg,#e0f7ef,#edfdf6)",
    accent: "#0e9e6e",
    tag: "Akademska praksa",
  },
  {
    Icon: IconTrendingUp,
    label: "Biznis & Marketing",
    roles: ["Marketing asistent", "Sales intern", "HR praksa"],
    color: "#6d4ce1",
    bg: "linear-gradient(135deg,#ede8ff,#f5f2ff)",
    accent: "#6d4ce1",
    tag: "Brzo rastuće",
  },
  {
    Icon: IconCpu,
    label: "Inženjering",
    roles: ["Mašinsko inženjering", "Elektrotehnika", "Građevina"],
    color: "#e07b1a",
    bg: "linear-gradient(135deg,#fef0dd,#fff7ee)",
    accent: "#e07b1a",
    tag: "Industrijska praksa",
  },
  {
    Icon: IconPenTool,
    label: "Dizajn & Kreativa",
    roles: ["UI/UX Designer", "Grafički dizajn", "Motion design"],
    color: "#c0392b",
    bg: "linear-gradient(135deg,#fde8e6,#fff4f3)",
    accent: "#c0392b",
    tag: "Kreativni sektor",
  },
  {
    Icon: IconGlobe,
    label: "Pravo & Uprava",
    roles: ["Pravna praksa", "Javna uprava", "Notarska praksa"],
    color: "#2980b9",
    bg: "linear-gradient(135deg,#d6eaf8,#eaf4fb)",
    accent: "#2980b9",
    tag: "Institucionalna praksa",
  },
];

/* ══════════════════════════════════════
   AREAS CAROUSEL COMPONENT
══════════════════════════════════════ */
function AreasCarousel({ darkMode }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState("next");

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % AREAS.length, "next"), 3000);
    return () => clearInterval(t);
  }, [current]);

  function goTo(idx, dir) {
    if (idx === current) return;
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
    }, 300);
  }

  const area = AREAS[current];

  const slideStyle = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateY(0)"
      : direction === "next" ? "translateY(10px)" : "translateY(-10px)",
    transition: "opacity 0.3s ease, transform 0.3s ease",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", animation: "fadeUp 0.8s 0.15s ease both" }}>
      <div style={{
        background: darkMode ? "#1f2937" : "white", borderRadius: 20,
        boxShadow: "0 20px 60px rgba(26,111,212,0.14)",
        border: darkMode ? "1px solid #374151" : "1px solid #e0edf9",
        maxWidth: 400, width: "100%",
        overflow: "hidden",
      }}>

        {/* Coloured top area */}
        <div style={{
          background: area.bg,
          padding: "32px 32px 28px",
          borderBottom: "1px solid #e0edf9",
          transition: "background 0.5s ease",
        }}>
          {/* Tag pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: darkMode ? "#374151" : "white", color: area.accent,
            borderRadius: 20, padding: "3px 12px",
            fontSize: 11, fontWeight: 700, marginBottom: 20,
            border: `1px solid ${area.accent}40`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: area.accent }} />
            {area.tag}
          </div>

          {/* Icon + title */}
          <div style={slideStyle}>
            <div style={{
              width: 62, height: 62, borderRadius: 16,
              background: darkMode ? "#374151" : "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
              boxShadow: `0 4px 18px ${area.accent}28`,
            }}>
              <area.Icon size={28} color={area.accent} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0d1f3c", margin: "0 0 5px" }}>
              {area.label}
            </h3>
            <p style={{ fontSize: 13, color: "#5a7a9a", margin: 0 }}>
              Pronađi praksu u ovoj oblasti
            </p>
          </div>
        </div>

        {/* Roles list */}
        <div style={{ padding: "20px 32px 24px", background: darkMode ? "#1f2937" : "white" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#9aabbc",
            textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
          }}>
            Primjeri pozicija
          </div>

          <div style={{ ...slideStyle, display: "flex", flexDirection: "column", gap: 9 }}>
            {area.roles.map(role => (
              <div key={role} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: area.accent, flexShrink: 0,
                }} />
                <span style={{ fontSize: 14, color: darkMode ? "#cbd5e1" : "#2a4a6a", fontWeight: 500 }}>{role}</span>
              </div>
            ))}
          </div>

          {/* Dots + prev/next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>

            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {AREAS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? "next" : "prev")}
                  style={{
                    width: i === current ? 20 : 7,
                    height: 7, borderRadius: 4,
                    border: "none", cursor: "pointer", padding: 0,
                    background: i === current ? area.accent : "#d0e3f7",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* Prev / Next arrows */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => goTo((current - 1 + AREAS.length) % AREAS.length, "prev")}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: darkMode ? "1px solid #374151" : "1px solid #d0e3f7", background: darkMode ? "#374151" : "white",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#4b5563" : "#f0f6ff"}
                onMouseLeave={e => e.currentTarget.style.background = darkMode ? "#374151" : "white"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "#cbd5e1" : "#3a5a8a"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => goTo((current + 1) % AREAS.length, "next")}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: darkMode ? "1px solid #374151" : "1px solid #d0e3f7", background: darkMode ? "#374151" : "white",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#4b5563" : "#f0f6ff"}
                onMouseLeave={e => e.currentTarget.style.background = darkMode ? "#374151" : "white"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "#cbd5e1" : "#3a5a8a"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Smooth scroll ─── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const NAV_LINKS = [
  { label: "Kako funkcioniše", sectionId: "kako-funkcionise" },
  { label: "Za studente",      sectionId: "za-studente" },
  { label: "Za kompanije",     sectionId: "za-kompanije" },
  { label: "O platformi",      sectionId: "o-platformi" },
];

  const ROLE_ROUTES = {
    STUDENT:     '/dashboard/student',
    COMPANY:     '/dashboard/company',
    COORDINATOR: '/dashboard/coordinator',
    ADMIN:       '/admin',
  };

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hov = (enter, leave) => ({
    onMouseEnter: e => Object.assign(e.currentTarget.style, enter),
    onMouseLeave: e => Object.assign(e.currentTarget.style, leave),
  });

  const btnPrimary = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 26px", borderRadius: 10, fontSize: 15, fontWeight: 700,
    color: "#fff", textDecoration: "none",
    background: "linear-gradient(135deg,#1a6fd4,#2d9cdb)",
    boxShadow: "0 4px 20px rgba(26,111,212,0.35)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };
  const btnOutline = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 26px", borderRadius: 10, fontSize: 15, fontWeight: 600,
    color: "#1a6fd4", textDecoration: "none",
    border: "1.5px solid #1a6fd4", background: "white",
    transition: "background 0.2s",
  };

  return (
   <div style={{
    fontFamily: "'Sora','Segoe UI',sans-serif",
    width: "100%",
    background: darkMode ? "#111827" : "#f0f6ff",
    color: darkMode ? "#f9fafb" : "#0d1f3c",
  }}
>
      {/* ══════════════ NAVBAR ══════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: darkMode ? "rgba(17,24,39,0.93)" : "rgba(255,255,255,0.93)",
        backdropFilter: "blur(14px)",
        borderBottom: darkMode ? "1px solid #374151" : "1px solid #d0e3f7",
        transition: "all 0.3s ease", padding: "0 2rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, height: 68 }}>

          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <img src="/logo2.png" alt="PraksaHub" style={{ height: 60 }} />
          </Link>

          <div className="lp-nav-links" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 10 }}>
            {NAV_LINKS.map(({ label, sectionId }) => (
              <button key={label} onClick={() => scrollToSection(sectionId)} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: darkMode ? "#cbd5e1" : "#3a5a8a", background: "transparent", border: "none",
                cursor: "pointer", transition: "background 0.2s", fontFamily: "inherit",
              }}
                {...hov({ background: darkMode ? "#1e293b" : "#e8f1fb" }, { background: "transparent" })}
              >{label}</button>
            ))}
          </div>

          <div className="lp-nav-actions" style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            <button onClick={() => { setDarkMode(!darkMode);}} title="Promijeni temu"
             style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #d0e3f7",
               background: "transparent", cursor: "pointer", display: "flex", alignItems: "center",
               justifyContent: "center", transition: "background 0.2s",
              }}
               {...hov({ background: darkMode ? "#1e293b" : "#e8f1fb" }, { background: "transparent" })}
            >{darkMode ? <IconSun size={17} color="#f9fafb" /> : <IconMoon size={17} color="#3a5a8a" />}
            </button>

            {user ? (
              <>
                <Link to={ROLE_ROUTES[user.role] ?? '/dashboard'} style={{
                  padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  color: "#fff", textDecoration: "none",
                  background: "linear-gradient(135deg,#1a6fd4,#2d9cdb)",
                  transition: "opacity 0.2s",
                }}
                  {...hov({ opacity: "0.88" }, { opacity: "1" })}
                >
                  {user.ime} {user.prezime}
                </Link>
                <button onClick={logout} style={{
                  ...btnOutline,
                  padding: "8px 18px",
                  fontSize: 14,
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                  {...hov({ background: "#e8f1fb" }, { background: "transparent" })}
                >Odjavi se</button>
              </>
            ) : (
              <>
                <Link to="/auth" style={{
                  padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  color: "#1a6fd4", textDecoration: "none", border: "1.5px solid #1a6fd4",
                  background: "transparent", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1a6fd4"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a6fd4"; }}
                >Prijavi se</Link>

                <Link to="/register" style={{
                  padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  color: "#fff", textDecoration: "none",
                  background: "linear-gradient(135deg,#1a6fd4,#2d9cdb)",
                  transition: "opacity 0.2s",
                }}
                  {...hov({ opacity: "0.88" }, { opacity: "1" })}
                >Registruj se</Link>
              </>
            )}
          </div>
          <button
            className="lp-darkmode-mobile"
            onClick={() => setDarkMode(!darkMode)}
            title="Promijeni temu"
            style={{ display: "none" }}
          >
            {darkMode ? <IconSun size={17} color="#f9fafb" /> : <IconMoon size={17} color="#3a5a8a" />}
          </button>
          {/* Hamburger — vidljiv samo na mobilnom */}
          <button
          className="lp-hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          style={{
            display: "none", // CSS ga pokazuje na mobilnom
            marginLeft: "0",
            width: 36, height: 36, borderRadius: 8,
            border: "1px solid #d0e3f7", background: "transparent",
            cursor: "pointer", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "#f9fafb" : "#3a5a8a"} strokeWidth="2.2" strokeLinecap="round">
            {mobileMenuOpen
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
         </button>
        </div>
      </nav>
      {/* Mobile navigation drawer */}
      <div className={`lp-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ label, sectionId }) => (
          <button key={label} onClick={() => { scrollToSection(sectionId); setMobileMenuOpen(false); }}>
            {label}
          </button>
      ))}
      <div className="lp-mobile-divider" />
        {user ? (
          <>
            <Link
              to={ROLE_ROUTES[user.role] ?? '/dashboard'}
              className="lp-mobile-btn-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Moj dashboard
            </Link>
            <button onClick={logout} style={{
              ...btnOutline,
              padding: "8px 18px",
              fontSize: 14,
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
              {...hov({ background: "#e8f1fb" }, { background: "transparent" })}
            >Odjavi se</button>
          </>
        ) : (
        <>
          <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Prijavi se</Link>
          <Link to="/register" className="lp-mobile-btn-primary" onClick={() => setMobileMenuOpen(false)}>Registruj se</Link>
        </>
      )}
      </div>

      {/* ══════════════ HERO ══════════════ */}
      <section className="lp-hero-section" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        background: darkMode ? "linear-gradient(160deg,#111827 0%,#1f2937 55%,#0f172a 100%)" : "linear-gradient(160deg,#e8f2ff 0%,#f0f6ff 55%,#ede8ff 100%)",
        padding: "100px 2rem 60px", position: "relative", overflow: "hidden",
        width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", top: "15%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,111,212,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "4%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,76,225,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div className="lp-hero-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", width: "100%" }}>

          {/* Left — text */}
          <div style={{ animation: "fadeUp 0.8s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ddeeff", color: "#1a6fd4", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, marginBottom: 24, border: "1px solid #b8d8f8" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a6fd4" }} />
              Digitalna platforma za studentske prakse
            </div>

            <h1 style={{ fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 700, lineHeight: 1.15, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 24px", letterSpacing: "-1px" }}>
              Pronađi svoju prvu<br />
              <span style={{ background: "linear-gradient(135deg,#1a6fd4,#6d4ce1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>profesionalnu praksu</span>
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.75, color: darkMode ? "#cbd5e1" : "#3a5a8a", margin: "0 0 36px", maxWidth: 480 }}>
              Centralizovana platforma koja povezuje studente, kompanije i fakultete. Prijava, praćenje i evaluacija prakse - sve na jednom mjestu.
            </p>

            <div className="lp-hero-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/register?role=student" style={btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,111,212,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,111,212,0.35)"; }}
              >Počni kao student <IconArrowRight size={15} color="white" /></Link>

              <Link to={user ? (ROLE_ROUTES[user.role] ?? '/dashboard') : '/listings/public'} style={btnOutline}
                {...hov({ background: "#e8f1fb" }, { background: "white" })}
              ><IconSearch size={16} color="#1a6fd4" /> Pregledaj prakse</Link>
            </div>

            
          </div>

          {/* Right — Areas Carousel */}
          <AreasCarousel darkMode={darkMode}/>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="lp-section-pad" id="kako-funkcionise" style={{ padding: "90px 2rem", background: darkMode ? "#111827" : "white", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 14px", letterSpacing: "-0.5px" }}>Kako funkcioniše?</h2>
            <p style={{ fontSize: 16, color: darkMode ? "#cbd5e1" : "#5a7a9a", maxWidth: 500, margin: "0 auto" }}>Jednostavan proces koji vodi od registracije do završene prakse</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {[
              { step:"01", Icon: IconUser,      title:"Registruj se",   desc:"Kreiraj profil kao student, kompanija ili koordinator fakulteta.", color:"#1a6fd4", bg:"#ddeeff" },
              { step:"02", Icon: IconSearch,    title:"Pronađi praksu", desc:"Pretražuj i filtriraj oglase prema oblasti, trajanju i preferencama.", color:"#6d4ce1", bg:"#ede8ff" },
              { step:"03", Icon: IconFile,      title:"Prijavi se",     desc:"Pošalji prijavu s CV-om i motivacionim pismom direktno kroz platformu.", color:"#0e9e6e", bg:"#e0f7ef" },
              { step:"04", Icon: IconClipboard, title:"Prati status",   desc:"Prati odobravanje od strane kompanije i koordinatora u realnom vremenu.", color:"#e07b1a", bg:"#fef0dd" },
            ].map(({ step, Icon, title, desc, color, bg }) => (
              <div key={step} style={{ background: darkMode ? "#1f2937" : "#f8fbff", border: "1px solid #e0edf9", borderRadius: 16, padding: 28, position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(26,111,212,0.11)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: 14, right: 16, fontSize: 26, fontWeight: 800, color: "#e8f0fa", userSelect: "none" }}>{step}</div>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontSize: 14, color: darkMode ? "#cbd5e1" : "#5a7a9a", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FOR STUDENTS ══════════════ */}
      <section className="lp-section-pad" id="za-studente" style={{ padding: "90px 2rem", background: darkMode ? "linear-gradient(160deg,#0f172a,#1f2937)" : "linear-gradient(160deg,#f0f6ff,#f5f0ff)", width: "100%", boxSizing: "border-box" }}>
        <div className="lp-two-col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "#ddeeff", color: "#1a6fd4", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, marginBottom: 18, border: "1px solid #b8d8f8" }}>Za studente</div>
            <h2 style={{ fontSize: "clamp(1.7rem,2.5vw,2.2rem)", fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 20px", letterSpacing: "-0.5px" }}>Sve prakse na jednom mjestu</h2>
            <p style={{ fontSize: 16, color: darkMode ? "#cbd5e1" : "#3a5a8a", lineHeight: 1.75, margin: "0 0 28px" }}>
              Prestani pretraživati desetine platformi. PraksaHub ti daje centralizovan pregled svih dostupnih praksi, jasan uvid u status prijava i automatske notifikacije o svim promjenama.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 13 }}>
              {["Pregled svih aktivnih oglasa s filtriranjem","Upload CV-a i motivacionog pisma (PDF)","Praćenje statusa prijave u realnom vremenu","Notifikacije o promjenama statusa","Dashboard s pregledom svih aktivnosti","Evaluacija kompanije po završetku prakse"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: darkMode ? "#cbd5e1" : "#2a4a6a" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#ddeeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconCheck size={12} color="#1a6fd4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register?role=student" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, background: "linear-gradient(135deg,#1a6fd4,#2d9cdb)", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(26,111,212,0.3)" }}>
              Registruj se kao student <IconArrowRight size={14} color="white" />
            </Link>
          </div>

          <div className="lp-feature-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { Icon: IconClipboard, title: "Status prijave",   val: "Koordinator → Kompanija",   color: "#1a6fd4", bg: "#ddeeff" },
              { Icon: IconFile,      title: "Moji dokumenti",   val: "CV + Motivaciono pismo",  color: "#6d4ce1", bg: "#ede8ff" },
              { Icon: IconBell,      title: "Notifikacije",     val: "3 nove obavijesti",        color: "#0e9e6e", bg: "#e0f7ef" },
              { Icon: IconStar,      title: "Evaluacija",       val: "Ocijeni kompaniju",        color: "#e07b1a", bg: "#fef0dd" },
            ].map(({ Icon, title, val, color, bg }) => (
              <div key={title} style={{ background: darkMode ? "#1f2937" : "white", border: darkMode ? "1px solid #374151" : "1px solid #e0edf9", borderRadius: 14, padding: 22, boxShadow: "0 2px 12px rgba(26,111,212,0.07)", transition: "transform 0.2s" }}
                {...hov({ transform: "translateY(-3px)" }, { transform: "translateY(0)" })}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontSize: 12, color: "#6a88aa", marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FOR COMPANIES ══════════════ */}
      <section id="za-kompanije" style={{ padding: "90px 2rem", background: darkMode ? "#111827" : "white", width: "100%", boxSizing: "border-box" }}>
        <div className="lp-two-col"  style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div className="lp-companies-badge-mobile">Za kompanije</div>
          <div className="lp-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { Icon: IconBriefcase, title: "Upravljanje oglasima",    desc: "Kreiraj, uredi i zatvori oglase za praksu u par klikova.",      color: "#1a6fd4", bg: "#ddeeff" },
              { Icon: IconUser,      title: "Profili kandidata",       desc: "Pregledaj dokumente i kvalifikacije svakog apliciranta.",        color: "#6d4ce1", bg: "#ede8ff" },
              { Icon: IconLayers,    title: "Selekcija kandidata",     desc: "Označi uži krug i obavijesti studente automatski.",              color: "#0e9e6e", bg: "#e0f7ef" },
              { Icon: IconGlobe,     title: "Izvještaji i statistike", desc: "Uvid u prijave, prisustvo i evaluacije na jednom mjestu.",       color: "#e07b1a", bg: "#fef0dd" },
            ].map(({ Icon, title, desc, color, bg }) => (
              <div key={title} style={{ background: darkMode ? "#1f2937" : "#f8fbff", border: darkMode ? "1px solid #374151" : "1px solid #e0edf9", borderRadius: 14, padding: 22, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(26,111,212,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6a88aa", lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="lp-companies-badge-desktop" style={{ display: "inline-block", background: "#ede8ff", color: "#6d4ce1", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, marginBottom: 18, border: "1px solid #c9bbf5" }}>Za kompanije</div>
            <h2 style={{ fontSize: "clamp(1.7rem,2.5vw,2.2rem)", fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 20px", letterSpacing: "-0.5px" }}>Pronađi pravu radnu snagu</h2>
            <p style={{ fontSize: 16, color: darkMode ? "#cbd5e1" : "#3a5a8a", lineHeight: 1.75, margin: "0 0 28px" }}>
              Jednostavno postavljanje oglasa, pregled profila kandidata i efikasan proces selekcije - sve integrisano s fakultetskim koordinatorima.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 13 }}>
              {["Kreiranje i upravljanje oglasima za praksu","Pregled profila i dokumenata kandidata","Evidencija prisustva studenta na praksi","Standardizovani obrasci za evaluaciju","Automatsko generisanje ugovora o praksi","Statistika i izvještaji o prijavama"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: darkMode ? "#cbd5e1" : "#2a4a6a" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#ede8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconCheck size={12} color="#6d4ce1" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register?role=kompanija" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, background: "linear-gradient(135deg,#6d4ce1,#8b6cf0)", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(109,76,225,0.3)" }}>
              Registruj kompaniju <IconArrowRight size={14} color="white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ ROLES ══════════════ */}
      <section id="o-platformi" style={{ padding: "90px 2rem", background: darkMode ? "#1f2937" : "#f0f6ff", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 14px", letterSpacing: "-0.5px" }}>Ko koristi PraksaHub?</h2>
            <p style={{ fontSize: 16, color: darkMode ? "#cbd5e1" : "#5a7a9a", maxWidth: 500, margin: "0 auto" }}>Četiri uloge, jedna platforma</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 24 }}>
            {[
              {
                role: "Student", Icon: IconUser, color: "#1a6fd4", bg: "#ddeeff", border: "#b8d8f8", top: "#1a6fd4",
                desc: "Pronalazi i prijavljuje se na prakse, prati status, unosi aktivnosti i evaluira kompaniju.",
                cta: { label: "Registruj se", to: "/register?role=student" },
              },
              {
                role: "Kompanija", Icon: IconBriefcase, color: "#6d4ce1", bg: "#ede8ff", border: "#c9bbf5", top: "#6d4ce1",
                desc: "Objavljuje oglase, pregledava prijave, selektuje kandidate i vodi evidenciju prakse.",
                cta: { label: "Registruj kompaniju", to: "/register?role=kompanija" },
              },
              {
                role: "Koordinator", Icon: IconClipboard, color: "#0e9e6e", bg: "#e0f7ef", border: "#a3e4be", top: "#0e9e6e",
                desc: "Odobrava prakse, prati napredak studenata i generiše izvještaje za fakultet.",
                cta: { label: "Registruj se", to: "/register?role=koordinator" },
              },
              {
                role: "Administrator", Icon: IconSettings, color: "#e07b1a", bg: "#fef0dd", border: "#fcd5a4", top: "#e07b1a",
                desc: "Upravlja korisnicima sistema, dodjeljuje uloge i prati historiju aktivnosti. Administratorski nalog se kreira interno.",
                cta: null,
              },
            ].map(({ role, Icon, color, bg, border, top, desc, cta }) => (
              <div key={role} style={{ background: darkMode ? "#1f2937" : "white", border: `1px solid ${border}`, borderTop: `4px solid ${top}`, borderRadius: 16, padding: 28, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: darkMode ? "#f9fafb" : "#0d1f3c", margin: "0 0 12px" }}>{role}</h3>
                <p style={{ fontSize: 14, color: darkMode ? "#cbd5e1" : "#5a7a9a", lineHeight: 1.65, margin: "0 0 20px" }}>{desc}</p>
                {cta ? (
                  <Link to={cta.to} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color, textDecoration: "none" }}>
                    {cta.label} <IconArrowRight size={13} color={color} />
                  </Link>
                ) : (
                  <span style={{ fontSize: 13, color: "#aab8cc", fontStyle: "italic" }}>Interno kreiranje naloga</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section style={{ padding: "80px 2rem", background: "linear-gradient(135deg,#0d1f3c,#1a3a6c)", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 700, color: "white", margin: "0 0 18px", letterSpacing: "-0.5px" }}>Spreman za svoju prvu praksu?</h2>
          <p style={{ fontSize: 17, color: "#99bbdd", margin: "0 0 36px", lineHeight: 1.75 }}>
            Pridruži se stotinama studenata koji su već pronašli svoju prvu profesionalnu praksu putem PraksaHub platforme.
          </p>
          <div className="lp-cta-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register?role=student" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#0d1f3c", textDecoration: "none", background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
              {...hov({ transform: "translateY(-2px)" }, { transform: "translateY(0)" })}
            >Registruj se besplatno <IconArrowRight size={14} color="#0d1f3c" /></Link>
            <Link to="/auth" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "white", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.35)", transition: "background 0.2s" }}
              {...hov({ background: "rgba(255,255,255,0.08)" }, { background: "transparent" })}
            >Prijavi se</Link>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: "#0a1628", padding: "48px 2rem 28px", color: "#6a88aa", width: "100%", boxSizing: "border-box",  position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="lp-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src="/logo2.png" alt="PraksaHub" style={{ height: 32 }} />
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>
                Digitalna platforma koja pojednostavljuje upravljanje studentskim praksama za sve učesnike procesa.
              </p>
            </div>
            {[
  {
    title: "Platforma",
    links: [
      { label: "Kako funkcioniše", type: "scroll", target: "kako-funkcionise" },
      { label: "O platformi",      type: "scroll", target: "o-platformi" },
    ],
  },
  {
    title: "Korisnici",
    links: [
      { label: "Za studente",  type: "scroll", target: "za-studente" },
      { label: "Za kompanije", type: "scroll", target: "za-kompanije" },
    ],
  },
  {
    title: "Pravno",
    links: [
      { label: "Uslovi korištenja",    type: "route", target: "/terms" },
      { label: "Politika privatnosti", type: "route", target: "/privacy" },
      { label: "Kolačići",             type: "route", target: "/cookies" },
    ],
  },
].map(({ title, links }) => (   // ← destrukturira title i links, ne label/type/target
  <div key={title}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#99bbdd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
    {links.map(({ label, type, target }) =>   // ← unutarnji map destrukturira svaki link
      type === "scroll" ? (
        <button
          key={label}
          onClick={() => scrollToSection(target)}
          style={{ display: "block", fontSize: 13, color: "#5a7a9a", marginBottom: 9, textDecoration: "none", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", textAlign: "left" }}
          onMouseEnter={e => e.currentTarget.style.color = "#99bbdd"}
          onMouseLeave={e => e.currentTarget.style.color = "#5a7a9a"}
        >{label}</button>
      ) : (
        <Link
          key={label}
          to={target}
          style={{ display: "block", fontSize: 13, color: "#5a7a9a", marginBottom: 9, textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#99bbdd"}
          onMouseLeave={e => e.currentTarget.style.color = "#5a7a9a"}
        >{label}</Link>
      )
    )}
  </div>
))}
          </div>
          <div className="lp-footer-bottom" style={{ borderTop: "1px solid #1a2d4a", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13 }}>© 2026 PraksaHub. Sva prava zadržana.</span>
            <span style={{ fontSize: 13 }}>Izgrađeno za studente, kompanije i fakultete.</span>
          </div>
        </div>
      </footer>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>

    </div>
  );
}
