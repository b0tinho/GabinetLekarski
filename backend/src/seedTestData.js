const bcrypt = require("bcryptjs");
const { AppDataSource } = require("./data-source");
const User = require("./entities/User");
const Doctor = require("./entities/Doctor");
const Patient = require("./entities/Patient");
const Visit = require("./entities/Visit");

const seedTestData = async (dataSource) => {
    try {
        const doctorRepo = dataSource.getRepository(Doctor);

        // 1. Sprawdź czy są już jacyś lekarze. Jeśli tak - przerwij.
        const doctorCount = await doctorRepo.count();
        if (doctorCount > 0) {
            console.log("ℹ️ Dane testowe już istnieją w bazie. Pomijam seedowanie.");
            return;
        }

        console.log("🌱 Rozpoczynam seedowanie danych testowych...");
        
        // Używamy Managera dla pewności operacji na EntitySchema
        const manager = dataSource.manager;
        const password = await bcrypt.hash("Haslo123!", 10);

        // --- TWORZENIE LEKARZY ---
        console.log("... Tworzenie lekarzy");
        
        const doctorsData = [
            { email: "kardiolog@med.pl", firstName: "Adam", lastName: "Serce", spec: "Kardiolog" },
            { email: "chirurg@med.pl", firstName: "Ewa", lastName: "Nóż", spec: "Chirurg" },
            { email: "internista@med.pl", firstName: "Jan", lastName: "Zdrówko", spec: "Internista" }
        ];

        const savedDoctors = [];

        for (const d of doctorsData) {
            // 1. User
            const user = manager.create(User, { 
                email: d.email, 
                password: password, 
                role: "DOCTOR" 
            });
            const savedUser = await manager.save(User, user);

            // 2. Doctor
            const doctor = manager.create(Doctor, { 
                firstName: d.firstName, 
                lastName: d.lastName, 
                specialization: d.spec, 
                user: savedUser 
            });
            const savedDoctor = await manager.save(Doctor, doctor);
            
            savedDoctors.push(savedDoctor);
        }

        // --- TWORZENIE PACJENTÓW ---
        console.log("... Tworzenie pacjentów");

        const patientsData = [
            { email: "pacjent1@test.pl", firstName: "Marek", lastName: "Chory", pesel: "90010111111" },
            { email: "pacjent2@test.pl", firstName: "Anna", lastName: "Kowalska", pesel: "92020222222" }
        ];

        const savedPatients = [];

        for (const p of patientsData) {
            // 1. User
            const user = manager.create(User, { 
                email: p.email, 
                password: password, 
                role: "PATIENT" 
            });
            const savedUser = await manager.save(User, user);

            // 2. Patient
            const patient = manager.create(Patient, { 
                firstName: p.firstName, 
                lastName: p.lastName, 
                pesel: p.pesel, 
                user: savedUser 
            });
            const savedPatient = await manager.save(Patient, patient);
            
            savedPatients.push(savedPatient);
        }

        // --- TWORZENIE WIZYT ---
        console.log("... Tworzenie wizyt");

        const today = new Date();
        
        // Wizyta 1: Jutro, zaplanowana
        const date1 = new Date(today); date1.setDate(today.getDate() + 1); date1.setHours(10, 0, 0);

        // Wizyta 2: Pojutrze, zaplanowana
        const date2 = new Date(today); date2.setDate(today.getDate() + 2); date2.setHours(12, 30, 0);

        // Wizyta 3: 3 dni temu, zakończona
        const date3 = new Date(today); date3.setDate(today.getDate() - 3); date3.setHours(14, 0, 0);

        const visitsData = [
            { date: date1, status: "PLANNED", doctor: savedDoctors[0], patient: savedPatients[0], desc: "Kontrola serca" },
            { date: date2, status: "PLANNED", doctor: savedDoctors[1], patient: savedPatients[1], desc: "Konsultacja przedzabiegowa" },
            { date: date3, status: "COMPLETED", doctor: savedDoctors[2], patient: savedPatients[0], desc: "Przeziębienie - wypisano leki" }
        ];

        for (const v of visitsData) {
            const visit = manager.create(Visit, {
                date: v.date,
                status: v.status,
                description: v.desc,
                doctor: v.doctor,
                patient: v.patient
            });
            await manager.save(Visit, visit);
        }

        console.log("✅ Dane testowe zostały pomyślnie dodane!");

    } catch (error) {
        console.error("❌ Błąd podczas seedowania danych:", error);
    }
};

module.exports = { seedTestData };