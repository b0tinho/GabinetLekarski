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
  const [visits, setVisits] = useState([]);
  const [editingVisit, setEditingVisit] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  //WYLOGOWANIE
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  //ZMIANA STRONY PACJENTÓW
const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          if (activeTab === "patients") {
              fetchPatients(newPage);
          } else if (activeTab === "doctors") {
              
              fetchDoctors(newPage);
          } else if (activeTab === "visits") {
              fetchVisits(newPage); 
          }
      }
  };
  //FORMATOWANIE DATY DLA INPUTA
  const formatForInput = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };
  //MINIMALNA DATA DLA INPUTA
  const getMinDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0,16);
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
  //USUWANIE PACJENTA
 const handleDeletePatient = async (patientId) => {
  if(!window.confirm("Czy na pewno chcesz usunąć tego pacjenta i jego konto?")) {
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/admin/patients/${patientId}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
        throw new Error("Nie udało się usunąć pacjenta");
    }
    setPatients(patients.filter((p) => p.id !== patientId));
    alert("Pacjent został usunięty.");
  } catch (err) {
    console.error("Błąd usuwania pacjenta:", err);
    alert(`Wystąpił błąd podczas usuwania: ${err.message}`);
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
  //EDYCJA WIZYTY 
  const handleUpdateVisit = async(e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const bodyData = {
              date: editingVisit.date,
              status: editingVisit.status,
              description: editingVisit.description,
              doctorId: editingVisit.doctorId
          };
      const response = await fetch(`http://localhost:3000/visits/${editingVisit.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      if (!response.ok) {
         throw new Error("Nie udało się zaktualizować wizyty");
      }
      alert("Wizyta została zaktualizowana.");
      setEditingVisit(null);
      fetchVisits();
    } catch (err) {
      console.error("Błąd edytowania wizyty:", err);  
    }
  }

  //USUWANIE WIZYTY
  const handleDeleteVisit = async (visitId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę wizytę?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/visits/${visitId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
         throw new Error("Nie udało się usunąć wizyty");
      }
      setVisits(visits.filter((v) => v.id !== visitId));
      alert("Wizyta została usunięta.");
    } catch (err) {
      console.error("Błąd usuwania wizyty:", err);  
    }
  };

  //POBIERANIE LISTY LEKARZY 
  const fetchDoctors = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/api/doctors?page=${pageNumber}&limit=5`, {
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
      setDoctors(data.data || []);
      if (data.meta) {
          setPage(data.meta.page);
          setTotalPages(data.meta.totalPages);
      }

    } 
    catch (error) {
      console.error("Nie udało się pobrać lekarzy:", error);
    }
  };

  //POBIERANIE LISTY PACJENTÓW 
  const fetchPatients = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) 
        { 
          navigate("/login"); 
          return; 
        }

      const response = await fetch(`http://localhost:3000/admin/patients?page=${pageNumber}&limit=5`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Błąd: ${response.status}`);

      const result = await response.json();
      setPatients(result.data || []);
      if (result.meta) {
          setPage(result.meta.page);
          setTotalPages(result.meta.totalPages);
      }

    } 
    catch (error) {
    console.error("Nie udało się pobrać pacjentów:", error);
    }
    finally {
      
    }
  };
  //POBIERANEI LISTY WIZYT
  const fetchVisits = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`http://localhost:3000/visits?page=${pageNumber}&limit=5`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Błąd: ${response.status}`);

      const result = await response.json();
      console.log("Pobrane wizyty:", result);
      setVisits(result.data || []);
      if (result.meta) {
          setPage(result.meta.page);
          setTotalPages(result.meta.totalPages);
      }
    } catch (error) {
      console.error("Nie udało się pobrać wizyt:", error);
    }
  };

 
  useEffect(() => {
    setPage(1);
    if (activeTab === "patients") {
      fetchPatients(1);
    } else if (activeTab === "doctors") {
      fetchDoctors(1);
    }
    else if (activeTab === "visits") {
      fetchVisits(1);
    }
  }, [activeTab]);

  //WIDOKI
  const renderContent = () => {
    switch (activeTab) {
      //WIZYTY
      case "visits": 
      if (editingVisit) {
            return (
                <div className="table-container" style={{ maxWidth: "600px" }}>
                    <h2>Edytuj Wizytę (ID: {editingVisit.id})</h2>
                    <form onSubmit={handleUpdateVisit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        
                        <label>Data i czas:</label>
                        <input 
                            type="datetime-local"
                            value={editingVisit.date}
                            onChange={(e) => setEditingVisit({...editingVisit, date: e.target.value})}
                            required
                            min={getMinDateTimeLocal()}
                            style={{padding: "10px"}}
                        />

                        <label>Lekarz:</label>
                        <select 
                            value={editingVisit.doctorId} 
                            onChange={(e) => setEditingVisit({...editingVisit, doctorId: e.target.value})}
                            style={{padding: "10px"}}
                            required
                        >
                            <option value="">-- Wybierz lekarza --</option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.firstName} {doc.lastName} ({doc.specialization})</option>
                            ))}
                        </select>

                        <label>Status:</label>
                        <select 
                            value={editingVisit.status}
                            onChange={(e) => setEditingVisit({...editingVisit, status: e.target.value})}
                            style={{padding: "10px"}}
                        >
                            <option value="PLANNED">Planowana (PLANNED)</option>
                            <option value="COMPLETED">Zakończona (COMPLETED)</option>
                            <option value="CANCELLED">Odwołana (CANCELLED)</option>
                        </select>

                        <label>Opis / Notatki:</label>
                        <textarea 
                            value={editingVisit.description}
                            onChange={(e) => setEditingVisit({...editingVisit, description: e.target.value})}
                            rows="4"
                            placeholder="Notatki administratora..."
                            style={{padding: "10px", resize: "vertical"}}
                        />

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                            <button type="submit" className="nav-btn" style={{ background: "#2ea043", flex: 1 }}>Zapisz Zmiany</button>
                            <button type="button" className="nav-btn" style={{ background: "#555", flex: 1 }} onClick={() => setEditingVisit(null)}>Anuluj</button>
                        </div>
                    </form>
                </div>
            );
        }
        return (
          <div className="table-container">
            <h2>Wszystkie Wizyty</h2>
            {visits.length === 0 ? (
              <p>Brak wizyt w systemie.</p>
            ) : (
              <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Pacjent</th>
                    <th>Lekarz</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id}>
                      <td>{new Date(visit.date).toLocaleString()}</td>
                      <td>
                        {visit.patient 
                          ? `${visit.patient.firstName} ${visit.patient.lastName}` 
                          : "Brak danych"}
                      </td>
                      <td>
                        {visit.doctor 
                          ? `${visit.doctor.firstName} ${visit.doctor.lastName}` 
                          : "Brak danych"}
                      </td>
                      <td>
                        <span className={`status-badge status-${visit.status ? visit.status.toLowerCase() : 'planned'}`}>
                            {visit.status}
                        </span>
                      </td>
                      <td>
                        <button
                            className="action-btn"
                            style={{ backgroundColor: "#646cff", marginRight: "5px" }}
                            onClick={() => {
                                if(doctors.length === 0) fetchDoctors();

                                setEditingVisit({
                                    id: visit.id,
                                    date: formatForInput(visit.date),
                                    status: visit.status || 'SCHEDULED',
                                    description: visit.description || '',
                                    doctorId: visit.doctor ? visit.doctor.id : ''
                                });
                            }}
                        >
                            Edytuj
                        </button>
                        <button 
                            className="action-btn"
                            style={{ backgroundColor: "#da3633" }}
                            onClick={() => handleDeleteVisit(visit.id)}
                        >
                            Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px", alignItems: "center" }}>
                        <button className="nav-btn" style={{width:"auto", background: page===1?"#333":"#646cff", cursor: page===1?"not-allowed":"pointer"}} disabled={page===1} onClick={()=>handlePageChange(page-1)}>Poprzednia</button>
                        <span style={{color:"#ccc"}}>Strona {page} z {totalPages}</span>
                        <button className="nav-btn" style={{width:"auto", background: page===totalPages?"#333":"#646cff", cursor: page===totalPages?"not-allowed":"pointer"}} disabled={page===totalPages} onClick={()=>handlePageChange(page+1)}>Następna</button>
                    </div>
                )}
              </>
            )}
          </div>
        );
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
              <h3>Wszystkie wizyty</h3>
              <p className="stat-number">{visits.length > 0 ? visits.length : "-"}</p>
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
          <>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>PESEL</th>
                <th>Telefon</th>
                <th>Email</th> 
                <th>Akcje</th>
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
                  <td>
                        <button 
                            className="action-btn"
                            style={{ backgroundColor: "#da3633" }}
                            onClick={() => handleDeletePatient(p.id)}
                        >
                            Usuń
                        </button>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px", alignItems: "center" }}>
                        <button 
                            className="nav-btn" 
                            style={{ width: "auto", background: page === 1 ? "#333" : "#646cff", cursor: page === 1 ? "not-allowed" : "pointer" }}
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                        >
                            Poprzednia
                        </button>
                        
                        <span style={{ color: "#ccc" }}>Strona {page} z {totalPages}</span>
                        
                        <button 
                            className="nav-btn" 
                            style={{ width: "auto", background: page === totalPages ? "#333" : "#646cff", cursor: page === totalPages ? "not-allowed" : "pointer" }}
                            disabled={page === totalPages}
                            onClick={() => handlePageChange(page + 1)}
                        >
                            Następna
                        </button>
                    </div>
                )}
           </>
                
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
            <>
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
                
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px", alignItems: "center" }}>
                        <button 
                            className="nav-btn" 
                            style={{width:"auto", background: page===1?"#333":"#646cff", cursor: page===1?"not-allowed":"pointer"}} 
                            disabled={page===1} 
                            onClick={()=>handlePageChange(page-1)}
                        >
                            Poprzednia
                        </button>
                        
                        <span style={{color:"#ccc"}}>Strona {page} z {totalPages}</span>
                        
                        <button 
                            className="nav-btn" 
                            style={{width:"auto", background: page===totalPages?"#333":"#646cff", cursor: page===totalPages?"not-allowed":"pointer"}} 
                            disabled={page===totalPages} 
                            onClick={()=>handlePageChange(page+1)}
                        >
                            Następna
                        </button>
                    </div>
                )}
              </> 
            )}
          </div>
        )

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
            <li><button className={activeTab === "visits" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("visits")}>Wizyty</button></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Wyloguj się</button>
      </aside>
      <main className="admin-main">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;