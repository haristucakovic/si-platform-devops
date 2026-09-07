import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function CreateListingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    naziv: "",
    opis: "",
    brojMjesta: "",
    rokPrijave: "",
    datumPocetka: "",
    trajanje: "",
    oblast: "",
    placenaPraksa: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiRequest("/listings", {
        method: "POST",
        body: JSON.stringify(form),
      });

      alert("Oglas uspješno kreiran!");
      navigate("/dashboard/company");
    } catch (err) {
      alert(err.message || "Greška pri kreiranju oglasa.");
    }
  };

  return (
    <div className="container">
      <h2>Kreiraj oglas</h2>

      <form onSubmit={handleSubmit}>
        <input name="naziv" placeholder="Naziv" onChange={handleChange} required />
        <textarea name="opis" placeholder="Opis" onChange={handleChange} required />
        <input type="number" name="brojMjesta" placeholder="Broj mjesta" onChange={handleChange} required />
        <input type="date" name="rokPrijave" onChange={handleChange} required />
        <input type="date" name="datumPocetka" onChange={handleChange} required />
        <input type="number" min="1" step="1" name="trajanje" placeholder="Trajanje (mjeseci)" onChange={handleChange} required />
        <input name="oblast" placeholder="Oblast" onChange={handleChange} />

        <label>
          <input type="checkbox" name="placenaPraksa" onChange={handleChange} />
          Plaćena praksa
        </label>

        <button type="submit">Objavi oglas</button>
      </form>
    </div>
  );
}
