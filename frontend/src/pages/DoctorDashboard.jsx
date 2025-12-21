import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css"; 

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    //WIZYTY LEKARZA
    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/visits', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Błąd serwera: ${response.status}`);
            }

            const data = await response.json();
            setAppointments(data.data || (Array.isArray(data) ? data : [])); 
        } catch (error) {
            console.error("Błąd pobierania wizyt:", error);
        }
    };

    //UPDATE WIZYTY
    const updateStatus = async (visitId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/visits/${visitId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error("Nie udało się zmienić statusu");
            
            
            fetchAppointments();

        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div style={{ marginBottom: "30px", textAlign: "center" }}>
                    <h2 style={{ color: "#646cff", margin: 0 }}>MedSystem</h2>
                    <small style={{ color: "#aaa" }}>Panel Lekarza</small>
                </div>
                <nav>
                    <ul>
                        <li>
                            <button 
                                className={activeTab === 'appointments' ? 'nav-btn active' : 'nav-btn'} 
                                onClick={() => setActiveTab('appointments')}
                            >
                                Harmonogram
                            </button>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className="logout-btn">Wyloguj</button>
            </aside>

         
            <main className="admin-main">
                {activeTab === 'appointments' && (
                    <div className="table-container">
                        <h3>Harmonogram Wizyt</h3>
                        
                        {appointments.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Pacjent</th>
                                        <th>Status</th>
                                        <th>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((visit) => (
                                        <tr key={visit.id}>
                                            <td>{new Date(visit.date).toLocaleString()}</td>
                                            
                                            <td>
                                                {visit.patient 
                                                    ? `${visit.patient.firstName} ${visit.patient.lastName}` 
                                                    : "Brak danych"}
                                            </td>
                                            <td>{visit.status || "Zaplanowana"}</td>
                                            <td>
                                                
                                                {visit.status === 'SCHEDULED' && (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button 
                                                            onClick={() => updateStatus(visit.id, 'COMPLETED')}
                                                            style={{
                                                                backgroundColor: "#2ea043", 
                                                                color: "white",
                                                                border: "none",
                                                                padding: "5px 10px",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            Zakończ
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStatus(visit.id, 'CANCELLED')}
                                                            style={{
                                                                backgroundColor: "#da3633", 
                                                                color: "white",
                                                                border: "none",
                                                                padding: "5px 10px",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            Odwołaj
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Brak zaplanowanych wizyt.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;