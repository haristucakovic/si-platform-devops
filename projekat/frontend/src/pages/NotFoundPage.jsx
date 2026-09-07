import { useTheme } from "../context/ThemeContext";

export default function NotFoundPage() {
  const { darkMode } = useTheme();

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Sora, sans-serif",
        background: darkMode ? "#111827" : "#f0f6ff",
        color: darkMode ? "#f9fafb" : "#0d1f3c",
      }}
    >
      <h1
        style={{
          color: "#1a6fd4",
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: "18px",
          color: darkMode ? "#cbd5e1" : "#666",
        }}
      >
        Ups! Stranica koju tražiš ne postoji.
      </p>

      <a
        href="/"
        style={{
          color: "#1a6fd4",
          marginTop: "20px",
          textDecoration: "none",
          fontWeight: "600",
        }}
      >
        Vrati se na početnu
      </a>
    </main>
  );
}