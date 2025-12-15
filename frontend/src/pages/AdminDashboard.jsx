import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  //STANY 
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);

  //WYLOGOWANIE
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  //DODAWANIE LEKARZA 
  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    
    const newDoctor = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      specialization: formData.get("specialization"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const token = localStorage.getItem("token");

      
      const response = await fetch("http://localhost:3000/admin/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newDoctor),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Błąd dodawania lekarza");
      }

      alert("Lekarz został dodany pomyślnie!");
      setIsAddingDoctor(false); 
      fetchDoctors();           

    } catch (err) {
      console.error("Błąd dodawania lekarza:", err);
      alert(`Wystąpił błąd: ${err.message}`);
    }
  };

  //USUWANIE LEKARZA  
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego lekarza i jego konto?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/admin/doctors/${doctorId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
         throw new Error("Nie udało się usunąć lekarza");
      }

      setDoctors(doctors.filter((doc) => doc.id !== doctorId));
      alert("Lekarz został usunięty.");

    } catch (err) {
      console.error("Błąd usuwania lekarza:", err);
      alert("Wystąpił błąd podczas usuwania.");
    }
  };

  //POBIERANIE LISTY LEKARZY 
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:3000/api/doctors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Błąd pobierania lekarzy: ${response.status}`);
      }

      const data = await response.json();
      console.log("Pobrani lekarze:", data);
      setDoctors(data);

    } 
    finally {
      
    }
  };

  //POBIERANIE LISTY PACJENTÓW 
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) 
        { 
          navigate("/login"); 
          return; 
        }

      const response = await fetch("http://localhost:3000/admin/patients", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Błąd: ${response.status}`);

      const result = await response.json();
      console.log("Pobrani pacjenci:", result);
      setPatients(result.data);

    } 
    catch (error) {
    console.error("Nie udało się pobrać pacjentów:", error);
    }
    finally {
      
    }
  };

 
  useEffect(() => {
    if (activeTab === "patients") {
      fetchPatients();
    } else if (activeTab === "doctors") {
      fetchDoctors();
    }
  }, [activeTab]);

  //WIDOKI
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Zarejestrowani Pacjenci</h3>
              <p className="stat-number">{patients.length > 0 ? patients.length : "-"}</p>
            </div>
            <div className="stat-card">
              <h3>Dostępni Lekarze</h3>
              <p className="stat-number">{doctors.length > 0 ? doctors.length : "-"}</p>
            </div>
            <div className="stat-card">
              <h3>Dzisiejsze wizyty</h3>
              <p className="stat-number">5</p>
            </div>
          </div>
        );

      case "patients":
    return (
      //tabela pacjentów
      <div className="table-container">
        <h2>Lista Pacjentów</h2>
        
        {error && (<p style={{ color: "red", background: "#3d1a1a", padding: "10px" }}>{error} </p>)}
 
        {(!patients || !Array.isArray(patients) || patients.length === 0) && !error ? (
          <p>Brak pacjentów lub trwa ładowanie...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>PESEL</th>
                <th>Telefon</th>
                <th>Email</th> 
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.firstName}</td>
                  <td>{p.lastName}</td>
                  <td>{p.pesel || "-"}</td>
                  <td>{p.phoneNumber || "-"}</td>
                  <td>{p.email || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );

      case "doctors":
        if (isAddingDoctor) {
            // Formularz dodawania nowego lekarza
            return (
              <div className="table-container" style={{ maxWidth: "500px" }}>
                <h2>Dodaj Nowego Lekarza</h2>
                <form onSubmit={handleAddDoctorSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <input name="firstName" placeholder="Imię" required style={{padding: "10px"}} />
                  <input name="lastName" placeholder="Nazwisko" required style={{padding: "10px"}} />
                  <input name="specialization" placeholder="Specjalizacja" required style={{padding: "10px"}} />
                  <input name="email" type="email" placeholder="Email (Login)" required style={{padding: "10px"}} />
                  <input name="password" type="password" placeholder="Hasło" required style={{padding: "10px"}} />
                  
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" className="nav-btn" style={{ background: "#646cff", flex: 1 }}>Zapisz</button>
                    <button type="button" className="nav-btn" style={{ background: "#555", flex: 1 }} onClick={() => setIsAddingDoctor(false)}>Anuluj</button>
                  </div>
                </form>
              </div>
            );
        }
        // Tabela lekarzy
        return (
          <div className="table-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Lista Lekarzy</h2>
              <button className="nav-btn" style={{ width: "auto", background: "#646cff" }} onClick={() => setIsAddingDoctor(true)}>
                + Dodaj Lekarza
              </button>
            </div>

            {error && <p style={{ color: "red", background: "#3d1a1a", padding: "10px" }}>{error}</p>}

            {doctors.length === 0 && !error ? (
              <p>Trwa ładowanie lub brak lekarzy...</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Imię</th><th>Nazwisko</th><th>Specjalizacja</th><th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.id}</td>
                      <td>{doctor.firstName}</td>
                      <td>{doctor.lastName}</td>
                      <td>{doctor.specialization}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          style={{
                            backgroundColor: "#ff4d4d",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      default:
        return <h2>Wybierz opcję z menu</h2>;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <h2 style={{ color: "#646cff", margin: 0 }}>MedSystem</h2>
          <small style={{ color: "#aaa" }}>Panel Administratora</small>
        </div>
        <nav>
          <ul>
            <li><button className={activeTab === "dashboard" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("dashboard")}>Pulpit</button></li>
            <li><button className={activeTab === "patients" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("patients")}>Pacjenci</button></li>
            <li><button className={activeTab === "doctors" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("doctors")}>Lekarze</button></li>
            
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Wyloguj się</button>
      </aside>
      <main className="admin-main">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;