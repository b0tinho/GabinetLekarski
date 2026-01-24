import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/AdminDashboard.css";

const PatientDashboard = () => {
    const navigate = useNavigate();
    
    
    const [activeTab, setActiveTab] = useState('appointments'); 
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: "",
        date: ""
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchAppointments(newPage);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role'); 
        navigate('/login');
    };

    const getMinDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0,16);
    };
//LISTA WIZYT PACJENTA
    const fetchAppointments = async (pageNumber = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/visits?page=${pageNumber}&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Błąd serwera: ${response.status}`);
            }

            const data = await response.json();
            
            setAppointments(data.data || []); 
            if (data.meta) {
                setPage(data.meta.page);
                setTotalPages(data.meta.totalPages);
            }
        } catch (err) {
            console.error("Błąd pobierania wizyt:", err);
        }
    }
//LISTA DOSTEPNYCH LEKARZY
    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/doctors', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setDoctors(Array.isArray(data) ? data : data.data || []);
            
        } catch (err) {
            console.error("Błąd pobierania lekarzy:", err);
        }
    }
//REZERWACJA WIZYTY
    const handleAddVisit = async (e) => {
        e.preventDefault();
        const selectedDate = new Date(formData.date);
        const now = new Date();
        if (selectedDate <= now) {
            alert("Nie można umówić wizyty w podanym terminie. Wybierz inny termin");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Błąd podczas dodawania wizyty');
            }
            
            alert("Wizyta umówiona pomyślnie!");
            await fetchAppointments(); 
            setActiveTab('appointments'); 
            setFormData({ doctorId: "", date: "" }); 
            
        } catch (err) {
            console.error("Błąd dodawania wizyty:", err);
            alert(`Wystąpił błąd: ${err.message}`);
        }
    }
//ODWOŁANIE WIZYTY (ZMIANA STATUSU NA CANCELLED)
    const handleCancelVisit = async (visitId) => {
        if(!window.confirm('Czy na pewno chcesz odwołać tę wizytę?')){
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/visits/${visitId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'CANCELLED' })
            }); 
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Nie udało się odwołać wizyty');
            }
            alert("Wizyta odwołana pomyślnie!");
            await fetchAppointments(); 
        } catch (err) {
            console.error("Błąd usuwania wizyty:", err);
            alert(`Wystąpił błąd: ${err.message}`);
        }
    }

    useEffect(() => {
        fetchAppointments(1);
        fetchDoctors();
    }, []);

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div style={{ marginBottom: "30px", textAlign: "center" }}>
                    <h2 style={{ color: "#646cff", margin: 0 }}>MedSystem</h2>
                    <small style={{ color: "#aaa" }}>Panel Pacjenta</small>
                </div>
                <nav>
                    <ul>
                        <li>
                            <button 
                                className={activeTab === 'appointments' ? 'nav-btn active' : 'nav-btn'} 
                                onClick={() => setActiveTab('appointments')}
                            >
                                Moje Wizyty
                            </button>
                        </li>
                        <li>
                            <button 
                                className={activeTab === 'book' ? 'nav-btn active' : 'nav-btn'} 
                                onClick={() => setActiveTab('book')}
                            >
                                Umów wizytę
                            </button>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className="logout-btn">Wyloguj</button>
            </aside>

            <main className="admin-main">
                {activeTab === 'appointments' && (
                    <div className="table-container">
                        <h3>Twoje wizyty</h3>
                        {appointments.length > 0 ? (
                            <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Lekarz</th>
                                        <th>Status</th>
                                        <th>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((visit, index) => (
                                        <tr key={visit.id || index}>
                                            <td>{new Date(visit.date).toLocaleString()}</td>
                                            <td>{visit.doctor ? `${visit.doctor.firstName} ${visit.doctor.lastName}` : "Brak danych"}</td>
                                            <td>{visit.status || "Zaplanowana"}</td>
                                            <td>
                                                  {visit.status === 'PLANNED' && (
                                                   <button 
                                                    className="action-btn btn-cancel"
                                                    onClick={() => handleCancelVisit(visit.id)}
                                                    title="Odwołaj wizytę"
                                                    >
                                                     Odwołaj
                                                    </button>
                                                 )}
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
                        ) : (
                            <p>Brak zaplanowanych wizyt.</p>
                        )}
                    </div>
                )}

                {activeTab === 'book' && (
                    <div className="table-container" style={{maxWidth: '500px'}}>
                        <h3>Umów nową wizytę</h3>
                        <form onSubmit={handleAddVisit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <label>Wybierz lekarza:</label>
                            <select 
                                value={formData.doctorId}
                                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                                required
                                style={{padding: '10px'}}
                            >
                                <option value="">-- Wybierz z listy --</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.firstName} {doc.lastName} ({doc.specialization})
                                    </option>
                                ))}
                            </select>

                            <label>Data wizyty:</label>
                            <input 
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                                min={getMinDateTimeLocal()}
                                style={{padding: '10px'}}
                            />

                            <button type="submit" className="nav-btn" style={{background: '#646cff'}}>Zatwierdź</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientDashboard;