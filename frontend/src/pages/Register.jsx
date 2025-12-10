import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    pesel: "",
    phoneNumber: ""
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/auth/register/patient", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            },
         body: JSON.stringify(formData),
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd rejestracji");
      }

      alert("Rejestracja udana");
      navigate("/login"); 
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Rejestracja Pacjenta</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="firstName" placeholder="Imię" onChange={handleChange} required />
        <input name="lastName" placeholder="Nazwisko" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Hasło" onChange={handleChange} required />
        <input name="pesel" placeholder="PESEL" onChange={handleChange} required />
        <input name="phoneNumber" placeholder="Numer telefonu" onChange={handleChange} required />
        
        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  );
};

export default Register;