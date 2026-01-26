# Dokumentacja Systemu Gabinetu Lekarskiego **MedSystem**

## 1. Wprowadzenie

### Krótki opis projektu  
**MedSystem** to kompleksowa aplikacja internetowa do zarządzania placówką medyczną. System integruje panel dla pacjentów, lekarzy oraz administratorów, umożliwiając pełną cyfryzację procesu umawiania wizyt i zarządzania personelem. Aplikacja została zbudowana w architekturze klient-serwer z wykorzystaniem konteneryzacji **Docker**.

### Cel aplikacji  
Celem projektu jest usprawnienie komunikacji między pacjentem a lekarzem oraz automatyzacja procesów administracyjnych w przychodni — takich jak rejestracja, harmonogramowanie wizyt i zarządzanie bazą danych personelu.

### Kluczowe funkcje i możliwości

#### Dla Pacjenta
- Rejestracja konta i logowanie.  
- Przeglądanie dostępnych lekarzy.  
- Umawianie wizyt online z walidacją dostępności terminów.  
- Podgląd historii i statusu wizyt.  
- Odwoływanie wizyt.

#### Dla Lekarza
- Dostęp do indywidualnego harmonogramu.  
- Zmiana statusu wizyt (Zakończona, Odwołana).  
- Dodawanie notatek i opisów do wizyt.

#### Dla Administratora
- Zarządzanie kontami użytkowników.  
- Dodawanie/usuwanie lekarzy i pacjentów.  
- Edycja oraz usuwanie wizyt.  
- Podgląd statystyk placówki.

#### System
- Bezpieczne uwierzytelnianie (JWT).  
- Automatyczne generowanie danych testowych (seed).  
- Separacja ról i autoryzacja.

---

## 2. Wykorzystane technologie

### Backend
- **Środowisko:** Node.js  
- **Framework:** Express.js  
- **Baza danych:** PostgreSQL  
- **ORM:** TypeORM  
- **Autoryzacja:** JWT, bcryptjs  

### Frontend
- **Biblioteka:** React  
- **Build tool:** Vite  
- **Routing:** React Router DOM  
- **Style:** CSS (modułowe oraz globalne)

### DevOps & Narzędzia
- **Konteneryzacja:** Docker, Docker Compose  
- **Zarządzanie bazą:** pgAdmin 4  

---

## 3. Instalacja i uruchomienie

### Wymagania wstępne
- Zainstalowany **Docker** oraz **Docker Compose**.  
- _(Opcjonalnie)_ Node.js i npm do uruchamiania lokalnego bez kontenerów.

### Klonowanie repozytorium

```bash
git clone https://github.com/twoje-konto/gabinet-lekarski.git
cd gabinet-lekarski
```
### Uruchomienie projektu
Aplikacja jest w pełni skonteneryzowana — uruchomienie środowiska deweloperskiego wymaga jednej komendy.

Upewnij się, że Docker jest aktywny, a następnie wykonaj (dla pierwszego uruchomienia z parametrem --build):
```bash
docker-compose up --build
```
System automatycznie:
- Pobierze obrazy PostgreSQL i pgAdmin.

- Zbuduje obrazy backendu oraz frontendu.

- Uruchomi migracje bazy danych.

- Wypełni bazę przykładowymi danymi (seed).


## 4. Instrukcje użytkowania
### Dostępne usługi (po uruchomieniu kontenerów)
| Usługa         | Adres lokalny         | Domyślne dane logowania            |
| -------------- | --------------------- | ---------------------------------- |
| Frontend   | http://localhost:5173 | —                                  |
| Backend API | http://localhost:3000 | —                                  |
| pgAdmin    | http://localhost:5050 | Email: admin@admin.com Hasło: admin |

### Dane logowania testowe
| Rola          | Email             | Hasło     |
| ------------- | ----------------- | --------- |
| Administrator | admin@gabinet.com | admin     |
| Lekarz        | kardiolog@med.pl  | Haslo123! |
| Pacjent       | pacjent1@test.pl  | Haslo123! |

### Zrzuty ekranu


## 5. Funkcjonalności
### Główne funkcje
- Uwierzytelnianie i autoryzacja: Zabezpieczenie tras middleware’ami authenticateToken i requireRole.

- Zarządzanie wizytami: Pełny cykl życia wizyty (planowanie → realizacja/odwołanie).

- Inteligentne seedowanie: Skrypt seedTestData.js generuje realistyczne dane o wizytach.

### Unikalne funkcjonalności
- Detekcja kolizji terminów: System uniemożliwia podwójną rezerwację (pacjent/lekarz).

- Dynamiczny dashboard: Statystyki aktualizowane w czasie rzeczywistym (co 5 sekund).

## 6. Struktura kodu
### Model danych (PostgreSQL + TypeORM)
User: Dane logowania i rola.

Doctor: Specjalizacja, relacja 1:1 z User.

Patient: Dane osobowe (PESEL), relacja 1:1 z User.

Visit: Połączenie Pacjent ↔ Lekarz, data, status, opis.
### Struktura katalogów
```bash
/backend
  /src
    /entities       # Modele bazodanowe (Doctor.js, Patient.js…)
    /routes         # Endpointy API (authRoutes.js, visitRoutes.js…)
    /middleware     # Logika autoryzacji (authMiddleware.js)
    app.js          # Punkt wejścia serwera

/frontend
  /src
    /pages          # Widoki (AdminDashboard.jsx, Login.jsx…)
    /components     # Komponenty wspólne (ProtectedRoute.jsx)
    App.jsx         # Główny routing aplikacji

docker-compose.yml  # Konfiguracja kontenerów
```

## 7. Przykład — rezerwacja wizyty z walidacją

Fragment kodu (backend/src/routes/patientRoutes.js):
```javascript
router.post("/book", authenticateToken, async (req, res) => {
    const { doctorId, date } = req.body; 

    // Walidacja danych wejściowych
    if (!doctorId || !date) {
        return res.status(400).json({ message: "Brak lekarza lub daty." });
    }

    try {
        const visitRepo = AppDataSource.getRepository(Visit);
        
        // 1. Pobranie profilu pacjenta na podstawie tokenu
        const patient = await AppDataSource.getRepository(Patient).findOneBy({ user: { id: req.user.id } });
        if (!patient) return res.status(403).json({ message: "Nie znaleziono profilu pacjenta." });

        // 2. SPRAWDZENIE KONFLIKTU PACJENTA
        // Czy pacjent nie ma już innej wizyty w tym samym czasie?
        const patientConflict = await visitRepo.createQueryBuilder("visit")
            .where("visit.patientId = :patientId", { patientId: patient.id })
            .andWhere("visit.date = :date", { date })
            .andWhere("visit.status != :status", { status: "CANCELLED" }) // Ignorujemy odwołane
            .getOne();

        if (patientConflict) {
            return res.status(409).json({ 
                message: "Masz już umówioną wizytę w tym terminie u innego lekarza!" 
            });
        }

        // 3. SPRAWDZENIE KONFLIKTU LEKARZA
        // Czy wybrany lekarz ma wolny termin?
        const doctorConflict = await visitRepo.createQueryBuilder("visit")
            .where("visit.doctorId = :doctorId", { doctorId })
            .andWhere("visit.date = :date", { date })
            .andWhere("visit.status != :status", { status: "CANCELLED" })
            .getOne();

        if (doctorConflict) {
            return res.status(409).json({ 
                message: "Ten lekarz ma już zajęty ten termin." 
            });
        }

        // 4. Zapisanie wizyty jeśli brak konfliktów
        const doctor = await AppDataSource.getRepository(Doctor).findOneBy({ id: doctorId });
        const newVisit = visitRepo.create({
            date: date,
            status: "PLANNED",
            patient: patient,
            doctor: doctor
        });

        await visitRepo.save(newVisit);
        res.status(201).json({ message: "Wizyta została pomyślnie zarezerwowana." });

    } catch (error) {
        // Obsługa błędów serwera
        console.error("Błąd rezerwacji:", error);
        res.status(500).json({ message: "Błąd serwera." });
    }
});
```
Poniższy kod odpowiada za proces umawiania wizyty po stronie klienta. Zawiera on wstępną walidację daty (blokada wyboru terminu z przeszłości) oraz obsługę komunikacji z API. (frontend/src/pages/PatientDashboard.jsx):
```javascript
// Pomocnicza funkcja ustawiająca minimalną datę w kalendarzu na "teraz"
const getMinDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0,16); // Format dla input type="datetime-local"
};

// Główna funkcja obsługująca wysłanie formularza
const handleAddVisit = async (e) => {
    e.preventDefault(); // Zapobiega przeładowaniu strony
    
    const selectedDate = new Date(formData.date);
    const now = new Date();

    // 1. WALIDACJA FRONTENDOWA
    // Sprawdzenie, czy użytkownik nie wybrał daty z przeszłości
    // (Zabezpieczenie UI, nawet jeśli backend też to sprawdza)
    if (selectedDate <= now) {
        alert("Nie można umówić wizyty w podanym terminie. Wybierz inny termin");
        return;
    }

    try {
        const token = localStorage.getItem('token');
        
        // 2. WYSŁANIE ŻĄDANIA DO API
        const response = await fetch('http://localhost:3000/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Przesłanie tokenu JWT
            },
            body: JSON.stringify(formData) // Dane: { doctorId, date }
        });
        
        // 3. OBSŁUGA BŁĘDÓW Z BACKENDU
        // Jeśli backend zwróci błąd (np. 409 Conflict - lekarz zajęty),
        // przechwytujemy go tutaj i wyświetlamy komunikat użytkownikowi.
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Błąd podczas dodawania wizyty');
        }
        
        // 4. SUKCES
        alert("Wizyta umówiona pomyślnie!");
        await fetchAppointments(); // Odświeżenie listy wizyt bez przeładowania strony
        setActiveTab('appointments'); // Przełączenie widoku na listę
        setFormData({ doctorId: "", date: "" }); // Wyczyszczenie formularza
        
    } catch (err) {
        console.error("Błąd dodawania wizyty:", err);
        // Wyświetlenie konkretnego komunikatu błędu (np. "Ten lekarz ma już zajęty ten termin")
        alert(`Wystąpił błąd: ${err.message}`);
    }
}
```
