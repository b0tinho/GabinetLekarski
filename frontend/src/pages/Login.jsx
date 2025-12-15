import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import "../styles/Auth.css";

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

      console.log("Zalogowano jako:", data.user.role); 

      const userRole = data.user.role; 
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", userRole); 

      
      if (userRole === "DOCTOR") {
        navigate("/doctor-dashboard");
      } 
      else if (userRole === "PATIENT") {
        navigate("/patient-dashboard");
      }
      else if (userRole === "ADMIN") {
        navigate("/admin-dashboard");
      } 
      else {
        console.warn("Nieznana rola:", userRole);
        navigate("/");
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Logowanie</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="auth-btn">Zaloguj się</button>
        </form>

        <div className="auth-footer">
          Nie masz konta? 
          <Link to="/register" className="auth-link">Zarejestruj się</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;