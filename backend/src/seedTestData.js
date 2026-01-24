const bcrypt = require("bcryptjs");
const { AppDataSource } = require("./data-source");
const User = require("./entities/User");
const Doctor = require("./entities/Doctor");
const Patient = require("./entities/Patient");
const Visit = require("./entities/Visit");

const seedTestData = async (dataSource) => {
    try {
        console.log("🌱 Weryfikacja danych testowych...");
        
        const manager = dataSource.manager;
        const password = await bcrypt.hash("Haslo123!", 10);

        
        const doctorsData = [
            { email: "kardiolog@med.pl", firstName: "Adam", lastName: "Serce", spec: "Kardiolog" },
            { email: "chirurg@med.pl", firstName: "Ewa", lastName: "Nóż", spec: "Chirurg" },
            { email: "internista@med.pl", firstName: "Jan", lastName: "Zdrówko", spec: "Internista" },
            { email: "okulista@med.pl", firstName: "Piotr", lastName: "Oko", spec: "Okulista" },
            { email: "dermatolog@med.pl", firstName: "Maria", lastName: "Gładka", spec: "Dermatolog" },
            { email: "laryngolog@med.pl", firstName: "Krzysztof", lastName: "Ucho", spec: "Laryngolog" },
            { email: "ortopeda@med.pl", firstName: "Michał", lastName: "Kość", spec: "Ortopeda" },
            { email: "pediatra@med.pl", firstName: "Anna", lastName: "Dziecko", spec: "Pediatra" },
            { email: "neurolog@med.pl", firstName: "Tomasz", lastName: "Mózg", spec: "Neurolog" },
            { email: "psychiatra@med.pl", firstName: "Zofia", lastName: "Spokój", spec: "Psychiatra" },
            { email: "stomatolog@med.pl", firstName: "Marek", lastName: "Ząbek", spec: "Stomatolog" },
            { email: "urolog@med.pl", firstName: "Jacek", lastName: "Nerka", spec: "Urolog" },
            { email: "ginekolog@med.pl", firstName: "Barbara", lastName: "Rodzina", spec: "Ginekolog" },
            { email: "onkolog@med.pl", firstName: "Robert", lastName: "Nadzieja", spec: "Onkolog" },
            { email: "reumatolog@med.pl", firstName: "Karolina", lastName: "Staw", spec: "Reumatolog" }
        ];

        const savedDoctors = [];

        for (const d of doctorsData) {
            let user = await manager.findOne(User, { where: { email: d.email } });
            
            if (!user) {
                user = manager.create(User, { email: d.email, password: password, role: "DOCTOR" });
                await manager.save(User, user);
                
                const doctor = manager.create(Doctor, { firstName: d.firstName, lastName: d.lastName, specialization: d.spec, user: user });
                await manager.save(Doctor, doctor);
                console.log(`   ✅ Dodano lekarza: ${d.email}`);
            } else {
               
            }

          
            const doctor = await manager.findOne(Doctor, { where: { user: { id: user.id } } });
            savedDoctors.push(doctor);
        }

       
        const patientsData = [
            { email: "pacjent1@test.pl", firstName: "Marek", lastName: "Chory", pesel: "90010111111" },
            { email: "pacjent2@test.pl", firstName: "Anna", lastName: "Kowalska", pesel: "92020222222" },
            { email: "pacjent3@test.pl", firstName: "Jan", lastName: "Nowak", pesel: "85031201234" },
            { email: "pacjent4@test.pl", firstName: "Katarzyna", lastName: "Wiśniewska", pesel: "99071509876" },
            { email: "pacjent5@test.pl", firstName: "Piotr", lastName: "Zieliński", pesel: "78112011223" },
            { email: "pacjent6@test.pl", firstName: "Agnieszka", lastName: "Mazur", pesel: "01220554321" },
            { email: "pacjent7@test.pl", firstName: "Tomasz", lastName: "Lew", pesel: "95050567890" },
            { email: "pacjent8@test.pl", firstName: "Magdalena", lastName: "Krawczyk", pesel: "88121233445" },
            { email: "pacjent9@test.pl", firstName: "Paweł", lastName: "Kamiński", pesel: "76093077665" },
            { email: "pacjent10@test.pl", firstName: "Monika", lastName: "Zając", pesel: "03210199887" },
            { email: "pacjent11@test.pl", firstName: "Grzegorz", lastName: "Król", pesel: "82041544556" },
            { email: "pacjent12@test.pl", firstName: "Elżbieta", lastName: "Wróbel", pesel: "55080811223" },
            { email: "pacjent13@test.pl", firstName: "Wojciech", lastName: "Jankowski", pesel: "60010155667" },
            { email: "pacjent14@test.pl", firstName: "Alicja", lastName: "Wojciechowska", pesel: "91022833441" },
            { email: "pacjent15@test.pl", firstName: "Kamil", lastName: "Kwiatkowski", pesel: "89111122334" }
        ];

        const savedPatients = [];

        for (const p of patientsData) {
            let user = await manager.findOne(User, { where: { email: p.email } });

            if (!user) {
                user = manager.create(User, { email: p.email, password: password, role: "PATIENT" });
                await manager.save(User, user);

                const patient = manager.create(Patient, { firstName: p.firstName, lastName: p.lastName, pesel: p.pesel, user: user });
                await manager.save(Patient, patient);
                console.log(`   ✅ Dodano pacjenta: ${p.email}`);
            } else {
               
            }

            const patient = await manager.findOne(Patient, { where: { user: { id: user.id } } });
            savedPatients.push(patient);
        }

        
        if (savedDoctors.length >= 3 && savedPatients.length >= 2) {
            
           
            const addDays = (days) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            date.setMinutes(0, 0, 0); 
            date.setHours(10 + (Math.abs(days) % 8)); 
            return date;
            };


            const visitsData = [
                { date: addDays(2), status: "PLANNED", doctor: savedDoctors[0], patient: savedPatients[0], desc: "Kontrola serca (Rutynowa)" },
                { date: addDays(5), status: "PLANNED", doctor: savedDoctors[1], patient: savedPatients[1], desc: "Konsultacja przedzabiegowa" },
                { date: addDays(-10), status: "COMPLETED", doctor: savedDoctors[2], patient: savedPatients[0], desc: "Przeziębienie - wypisano leki" },
                
                { date: addDays(-30), status: "COMPLETED", doctor: savedDoctors[3], patient: savedPatients[2], desc: "Badanie wzroku - dobranie okularów" }, // Okulista
                { date: addDays(-25), status: "COMPLETED", doctor: savedDoctors[4], patient: savedPatients[3], desc: "Konsultacja dermatologiczna - wysypka" }, // Dermatolog
                { date: addDays(-20), status: "COMPLETED", doctor: savedDoctors[5], patient: savedPatients[4], desc: "Ból ucha - zapalenie" }, // Laryngolog
                { date: addDays(-15), status: "COMPLETED", doctor: savedDoctors[6], patient: savedPatients[5], desc: "Złamanie palca - kontrola gipsu" }, // Ortopeda
                { date: addDays(-5),  status: "COMPLETED", doctor: savedDoctors[0], patient: savedPatients[6], desc: "EKG spoczynkowe" }, // Kardiolog

                { date: addDays(1),  status: "PLANNED", doctor: savedDoctors[7], patient: savedPatients[7], desc: "Bilans dwulatka" }, // Pediatra
                { date: addDays(3),  status: "PLANNED", doctor: savedDoctors[8], patient: savedPatients[8], desc: "Bóle głowy - migrena" }, // Neurolog
                { date: addDays(7),  status: "PLANNED", doctor: savedDoctors[9], patient: savedPatients[9], desc: "Konsultacja psychiatryczna" }, // Psychiatra
                { date: addDays(10), status: "PLANNED", doctor: savedDoctors[10], patient: savedPatients[10], desc: "Piaskowanie zębów" }, // Stomatolog
                { date: addDays(14), status: "PLANNED", doctor: savedDoctors[11], patient: savedPatients[11], desc: "Kontrola nerek USG" }, // Urolog
                { date: addDays(20), status: "PLANNED", doctor: savedDoctors[12], patient: savedPatients[0], desc: "Cytologia" }, // Ginekolog (Pacjent 0 ma już drugą wizytę!)
                
                { date: addDays(8),  status: "CANCELLED", doctor: savedDoctors[0], patient: savedPatients[5], desc: "Odwołana przez pacjenta (choroba)" },
                { date: addDays(4),  status: "CANCELLED", doctor: savedDoctors[4], patient: savedPatients[2], desc: "Lekarz na urlopie" },

                { date: addDays(15), status: "PLANNED", doctor: savedDoctors[1], patient: savedPatients[12], desc: "Wycięcie znamienia" },
                { date: addDays(16), status: "PLANNED", doctor: savedDoctors[2], patient: savedPatients[13], desc: "Szczepienie grypa" },
                { date: addDays(18), status: "PLANNED", doctor: savedDoctors[3], patient: savedPatients[14], desc: "Kontrola ciśnienia w oku" },
                { date: addDays(-2), status: "COMPLETED", doctor: savedDoctors[5], patient: savedPatients[1], desc: "Płukanie ucha" }
            ];

            for (const v of visitsData) {
                
                const existingVisit = await manager.findOne(Visit, {
                    where: {
                        date: v.date, 
                        doctor: { id: v.doctor.id }
                    }
                });

                if (!existingVisit) {
                    const visit = manager.create(Visit, {
                        date: v.date,
                        status: v.status,
                        description: v.desc,
                        doctor: v.doctor,
                        patient: v.patient
                    });
                    await manager.save(Visit, visit);
                    console.log(`   ✅ Dodano wizytę na: ${v.date.toISOString()}`);
                } else {
                    
                }
            }
        }

        console.log("🏁 Weryfikacja danych testowych zakończona.");

    } catch (error) {
        console.error("❌ Błąd podczas seedowania danych:", error);
    }
};

module.exports = { seedTestData };