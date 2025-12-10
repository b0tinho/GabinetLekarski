import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";


const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Witaj w systemie medycznym!</h1>
      <button onClick={handleLogout}>Wyloguj</button>
    </div>
  );
};


const Navigation = () => {
  const location = useLocation();

  const hideMenu = ["/patient-dashboard", "/doctor-dashboard"];

  if (hideMenu.includes(location.pathname)) {
    return null;
  }

  return (
    <nav style={{
        backgroundColor: "#1a1a1a",    
        padding: "20px 30px",          
        marginBottom: "40px",          
        display: "flex",
        justifyContent: "center",
        gap: "20px",                   
        maxWidth: "500px",             
        margin: "0 auto 40px auto"     
      }}>
        <Link 
          to="/login" 
          style={{ 
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#333",   
            color: "#ffffff",          
            textDecoration: "none",
            borderRadius: "8px",       
            fontWeight: "600",        
            transition: "all 0.2s ease-in-out", 
            border: "1px solid #444"   
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#444"; 
            e.currentTarget.style.transform = "translateY(-2px)"; 
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#333"; 
            e.currentTarget.style.transform = "translateY(0)"; 
          }}
        >
          Logowanie
        </Link>
        <Link 
          to="/register" 
          style={{ 
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#333",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.2s ease-in-out",
            border: "1px solid #444"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#444";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Rejestracja
        </Link>
      </nav>
  );
};

function App() {
  return (
    <Router>
      
      <Navigation />

      <Routes>
        <Route path="/" element={<div style={{textAlign: "center", color: "white", marginTop: "50px"}}>Wybierz opcję z menu</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/patient-dashboard" element={<Dashboard />} />
        <Route path="/doctor-dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;