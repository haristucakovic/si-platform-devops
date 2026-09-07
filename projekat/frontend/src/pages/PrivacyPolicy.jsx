import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function PrivacyPolicy() {
  const { darkMode } = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerStyle = {
    minHeight: "100vh",
    padding: "60px 2rem 80px",
    background: darkMode ? "#111827" : "#f8fbff",
    color: darkMode ? "#f9fafb" : "#0d1f3c",
  };

  const contentStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    lineHeight: 1.8,
  };

  const headingStyle = {
    fontSize: "2.2rem",
    fontWeight: 700,
    marginBottom: "20px",
  };

  const sectionTitle = {
    fontSize: "18px",
    fontWeight: 700,
    marginTop: "40px",
    marginBottom: "12px",
    color: darkMode ? "#e2e8f0" : "#0d1f3c"
  };

  const paragraphStyle = {
    fontSize: "15px",
    color: darkMode ? "#94a3b8" : "#3a5a8a",
  };

  const listStyle = {
    ...paragraphStyle,
    paddingLeft: "2.5rem", 
    marginTop: "8px",
  };

  return (
    <div>
      <div style={{ 
  padding: "10px 25px",
  background: darkMode ? "#1e2d45" : "#ffffff",  
  borderBottom: darkMode ? "1px solid #2d3f5a" : "1px solid #e2e8f0"
  }}>
      <img src="/logo2.png" alt="PraksaHub" style={{ height: "50px" }} />
    </div>
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Politika privatnosti</h1>

        <p style={paragraphStyle}>
          Ova Politika privatnosti opisuje način na koji PraksaHub prikuplja,
          koristi i štiti vaše lične podatke prilikom korištenja platforme.
        </p>

        <h2 style={sectionTitle}>1. Podaci koje prikupljamo</h2>
        <p style={paragraphStyle}>Možemo prikupljati sljedeće informacije:</p>
        <ul style={listStyle}>
          <li>Ime i prezime</li>
          <li>Email adresu</li>
          <li>Podatke o obrazovanju</li>
          <li>CV i druge dokumente koje uploadujete</li>
          <li>Podatke o aktivnosti na platformi</li>
        </ul>

        <h2 style={sectionTitle}>2. Kako koristimo podatke</h2>
        <p style={paragraphStyle}>Vaše podatke koristimo u svrhu:</p>
        <ul style={listStyle}>
          <li>Omogućavanja prijave na praksu</li>
          <li>Komunikacije između studenata i kompanija</li>
          <li>Praćenja statusa prijava</li>
          <li>Unapređenja platforme</li>
        </ul>

        <h2 style={sectionTitle}>3. Dijeljenje podataka</h2>
        <p style={paragraphStyle}>
          Vaši podaci se ne prodaju niti dijele trećim stranama osim kada je to
          potrebno za realizaciju procesa prijave.
        </p>

        <h2 style={sectionTitle}>4. Sigurnost podataka</h2>
        <p style={paragraphStyle}>
          Primjenjujemo tehničke i organizacione mjere zaštite kako bismo
          osigurali sigurnost vaših podataka.
        </p>

        <h2 style={sectionTitle}>5. Vaša prava</h2>
        <p style={paragraphStyle}>
          Imate pravo na pristup, ispravku i brisanje vaših ličnih podataka u
          skladu s važećim zakonima.
        </p>

        <h2 style={sectionTitle}>6. Izmjene politike</h2>
        <p style={paragraphStyle}>
          Zadržavamo pravo izmjene ove politike privatnosti. Sve izmjene će
          biti objavljene na ovoj stranici.
        </p>

        <p style={{ ...paragraphStyle, marginTop: "40px", fontSize: "13px" }}>
          Posljednje ažuriranje: April 2026.
        </p>
      </div>
    </div>
    </div>
  );
}