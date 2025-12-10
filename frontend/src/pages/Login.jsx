import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
     const response = await fetch("http://localhost:3000/auth/login", {
         method: "POST",
          headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData),
        });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd logowania");
      }

      
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      alert("Logowanie udane");
      
      
      if (data.role === "DOCTOR") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Logowanie</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Hasło" onChange={handleChange} required />
        
        <button type="submit">Zaloguj się</button>
      </form>
    </div>
  );
};

export default Login;