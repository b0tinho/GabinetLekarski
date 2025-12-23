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
            { email: "internista@med.pl", firstName: "Jan", lastName: "Zdrówko", spec: "Internista" }
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
            { email: "pacjent2@test.pl", firstName: "Anna", lastName: "Kowalska", pesel: "92020222222" }
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
            
           
            const today = new Date();
            today.setHours(0, 0, 0, 0); 

           
            const date1 = new Date(today); 
            date1.setDate(today.getDate() + 1); 
            date1.setHours(10, 0, 0, 0);

           
            const date2 = new Date(today); 
            date2.setDate(today.getDate() + 2); 
            date2.setHours(12, 30, 0, 0);

            
            const date3 = new Date(today); 
            date3.setDate(today.getDate() - 3); 
            date3.setHours(14, 0, 0, 0);

            const visitsData = [
                { date: date1, status: "PLANNED", doctor: savedDoctors[0], patient: savedPatients[0], desc: "Kontrola serca" },
                { date: date2, status: "PLANNED", doctor: savedDoctors[1], patient: savedPatients[1], desc: "Konsultacja przedzabiegowa" },
                { date: date3, status: "COMPLETED", doctor: savedDoctors[2], patient: savedPatients[0], desc: "Przeziębienie - wypisano leki" }
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