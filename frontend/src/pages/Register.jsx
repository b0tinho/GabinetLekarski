import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import "../styles/Auth.css";

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
    setFormData({...formData, [e.target.name]: e.target.value,});
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

      alert("Rejestracja udana! Możesz się teraz zalogować.");
      navigate("/login"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="clinic-title">🚑 MedSystem</h1>
        <p className="clinic-subtitle">Gabinet Lekarski</p>
        <h2>Rejestracja Pacjenta</h2>
        
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input 
              name="firstName" 
              placeholder="Imię" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="auth-input-group">
            <input 
              name="lastName" 
              placeholder="Nazwisko" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="auth-input-group">
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="auth-input-group">
            <input 
              name="password" 
              type="password" 
              placeholder="Hasło" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="auth-input-group">
            <input 
              name="pesel" 
              placeholder="PESEL" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="auth-input-group">
            <input 
              name="phoneNumber" 
              placeholder="Numer telefonu" 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="auth-btn">Zarejestruj się</button>
        </form>

        <div className="auth-footer">
          Masz już konto? 
          <Link to="/login" className="auth-link">Zaloguj się</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;