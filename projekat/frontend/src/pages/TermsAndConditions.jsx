import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function TermsAndConditions() {
  const { darkMode } = useTheme(); 
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const containerStyle = {
    minHeight: "100vh",
    padding: "60px 1.5rem 80px",
    background: darkMode ? "#111827" : "#f9fbff",
    display: "flex",
    justifyContent: "center",
  };

  const contentStyle = {
    maxWidth: "850px",
    width: "100%",
    lineHeight: 1.75,
    color: darkMode ? "#f9fafb" : "#1f2d3d",
  };

  const headingStyle = {
    fontSize: "2.4rem",
    fontWeight: 700,
    marginBottom: "30px",
    color: darkMode ? "#f1f5f9" : "#0d1f3c",
  };

  const sectionTitle = {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginTop: "40px",
    marginBottom: "10px",
    color: darkMode ? "#e2e8f0" : "#0d1f3c",
  };

  const paragraphStyle = {
    fontSize: "0.95rem",
    color: darkMode ? "#94a3b8" : "#445b78",
  };

  const listStyle = {
    paddingLeft: "20px",
    marginTop: "8px",
    color: darkMode ? "#94a3b8" : "#445b78",
    fontSize: "0.95rem",
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
        <h1 style={headingStyle}>Uslovi korištenja</h1>

        <p style={paragraphStyle}>
          Dobrodošli na PraksaHub platformu. Korištenjem ove web stranice
          potvrđujete da ste pročitali i prihvatili sljedeće uslove korištenja.
        </p>

        <h2 style={sectionTitle}>1. Prihvatanje uslova</h2>
        <p style={paragraphStyle}>
          Korištenjem platforme slažete se sa svim pravilima i odredbama
          navedenim u ovom dokumentu.
        </p>

        <h2 style={sectionTitle}>2. Opis usluge</h2>
        <p style={paragraphStyle}>
          PraksaHub omogućava studentima pronalazak stručne prakse i
          kompanijama objavljivanje otvorenih pozicija za praksu.
        </p>

        <h2 style={sectionTitle}>3. Korisnički nalog</h2>
        <p style={paragraphStyle}>
          Korisnici su odgovorni za tačnost podataka koje unesu prilikom
          registracije, kao i za sigurnost svojih pristupnih podataka.
        </p>

        <h2 style={sectionTitle}>4. Obaveze korisnika</h2>
        <ul style={listStyle}>
          <li>Platformu nećete koristiti u nezakonite svrhe.</li>
          <li>Nećete unositi lažne ili obmanjujuće informacije.</li>
          <li>Poštovat ćete druge korisnike i kompanije.</li>
        </ul>

        <h2 style={sectionTitle}>5. Ograničenje odgovornosti</h2>
        <p style={paragraphStyle}>
          PraksaHub ne garantuje zapošljavanje ili realizaciju prakse.
          Platforma služi kao posrednik između studenata i kompanija.
        </p>

        <h2 style={sectionTitle}>6. Intelektualno vlasništvo</h2>
        <p style={paragraphStyle}>
          Sav sadržaj na platformi (tekst, dizajn, logo i drugi elementi)
          zaštićen je autorskim pravima i ne smije se koristiti bez dozvole.
        </p>

        <h2 style={sectionTitle}>7. Izmjene uslova</h2>
        <p style={paragraphStyle}>
          Zadržavamo pravo izmjene ovih uslova u bilo kojem trenutku.
          Nastavkom korištenja platforme nakon izmjena, prihvatate nove uslove.
        </p>

        <p style={{ marginTop: "50px", fontSize: "0.8rem", color: "#7a8ca5" }}>
          Posljednje ažuriranje: April 2026.
        </p>
      </div>
    </div>
    </div>
  );
}