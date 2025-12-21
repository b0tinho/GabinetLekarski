import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

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
  const hideMenu = ["/patient-dashboard", "/doctor-dashboard", "/admin-dashboard", "/login", "/register"];

  if (hideMenu.includes(location.pathname)) {
    return null;
  }

  return (
    <nav style={{
        
        marginBottom: "40px",          
        display: "flex",
        justifyContent: "center",
        gap: "20px",                   
        width: "100%"     
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

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  
  
  const centeredPages = ["/", "/login", "/register"];
  const isCentered = centeredPages.includes(location.pathname);

  if (isCentered) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center",    
        minHeight: "100vh",       
        width: "100vw",
        backgroundColor: "#1a1a1a", 
        color: "white"
      }}>
        {children}
      </div>
    );
  }

 
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        
        <Navigation />

        <Routes>
          <Route path="/" element={<div style={{ textAlign: "center", color: "#aaa" }}><h3>Wybierz opcję z menu</h3></div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/patient-dashboard" element={ <ProtectedRoute allowedRoles={["PATIENT"]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/doctor-dashboard" element={ <ProtectedRoute allowedRoles={["DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        </Routes>

      </LayoutWrapper>
    </Router>
  );
}

export default App;