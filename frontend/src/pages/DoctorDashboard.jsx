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

    //FORMATOWANIE DATY
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            if (!response.ok) throw new Error(`Błąd serwera: ${response.status}`);

            const data = await response.json();
            setAppointments(data.data || (Array.isArray(data) ? data : [])); 
        } catch (error) {
            console.error("Błąd pobierania wizyt:", error);
        }
    };

    //UPDATE WIZYTY
    const updateVisit = async (visitId, updateData) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:3000/visits/${visitId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) throw new Error("Nie udało się zaktualizować wizyty");
            
            fetchAppointments(); 

        } catch (error) {
            alert(error.message);
        }
    };

    //ZMIANA STATUSU WIZYTY
    const handleStatusChange = (id, newStatus) => {
        if(window.confirm('Czy na pewno chcesz zmienić status wizyty?')) {
            updateVisit(id, { status: newStatus });
        }
    };

    //ZMIANA OPISU WIZYTY
    const handleDescriptionChange = (visit) => {
        const newDescription = prompt("Wprowadź nowy opis wizyty:", visit.description || "");
        if (newDescription !== null && newDescription !== visit.description) {
            updateVisit(visit.id, { description: newDescription });
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
                                        <th>Opis / Notatki</th> 
                                        <th>Status</th>
                                        <th>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((visit) => (
                                        <tr key={visit.id}>

                                            <td>{formatDate(visit.date)}</td>
                                            
                                            <td>
                                                {visit.patient 
                                                    ? `${visit.patient.firstName} ${visit.patient.lastName}` 
                                                    : "Brak danych"}
                                            </td>

                                            
                                            <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {visit.description || <span style={{color: "#555"}}>(brak)</span>}
                                            </td>

                                            <td>
                                                <span className={`status-badge status-${visit.status ? visit.status.toLowerCase() : 'scheduled'}`}>
                                                    {visit.status === 'PLANNED' && 'Zaplanowana'}
                                                    {visit.status === 'COMPLETED' && 'Zakończona'}
                                                    {visit.status === 'CANCELLED' && 'Odwołana'}
                                                    {!['PLANNED', 'COMPLETED', 'CANCELLED'].includes(visit.status) && visit.status}
                                                </span>
                                            </td>
                                            
                                            <td>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    
                                                    <button
                                                        onClick={() => handleDescriptionChange(visit)}
                                                        className="action-btn"
                                                        style={{ backgroundColor: "#444", color: "white" }}
                                                        title="Edytuj notatki"
                                                    >
                                                         Notatki
                                                    </button>

                                                    {visit.status === 'PLANNED' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleStatusChange(visit.id, 'COMPLETED')}
                                                                className="action-btn btn-complete"
                                                            >
                                                                 Zakończ
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusChange(visit.id, 'CANCELLED')}
                                                                className="action-btn btn-cancel"
                                                            >
                                                                 Odwołaj
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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