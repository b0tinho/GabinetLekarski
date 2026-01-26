const express = require("express");
const bcrypt = require("bcryptjs");
const { AppDataSource } = require("../data-source");
const User = require("../entities/User");
const Doctor = require("../entities/Doctor");
const { requireRole } = require("../middleware/authMiddleware");
const Patient = require("../entities/Patient");
const Visit = require("../entities/Visit");
const router = express.Router();


const userRepo = AppDataSource.getRepository(User);
const doctorRepo = AppDataSource.getRepository(Doctor);
const patientRepo = AppDataSource.getRepository(Patient);


// 1. Dodawanie Lekarza
router.post("/doctors", requireRole("ADMIN"), async (req, res) => {
    const { email, password, firstName, lastName, specialization } = req.body;


    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Brakuje wymaganych danych." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        

        await AppDataSource.transaction(async (transactionalEntityManager) => {
            

            const txUserRepo = transactionalEntityManager.getRepository(User);
            const txDoctorRepo = transactionalEntityManager.getRepository(Doctor);


            const newUser = txUserRepo.create({
                email: email,
                password: hashedPassword,
                role: "DOCTOR"
            });


            const savedUser = await txUserRepo.save(newUser);


            const newDoctor = txDoctorRepo.create({
                firstName: firstName,
                lastName: lastName,
                specialization: specialization,
                user: savedUser
            });

            await txDoctorRepo.save(newDoctor);
        });


        res.status(201).json({ message: "Lekarz utworzony pomyślnie" });

    } catch (error) {
        console.error("Błąd dodawania lekarza:", error);
        if (error.code === '23505') { 
             return res.status(409).json({ message: "Taki email już istnieje." });
        }
        res.status(500).json({ message: error.message });
    }
});

// 2. Usuwanie Lekarza
router.delete("/doctors/:id", requireRole("ADMIN"), async (req, res) => {
    const { id } = req.params;

    try {
        const doctor = await doctorRepo.findOne({ 
            where: { id: req.params.id }, 
            relations: ["user"] 
        });

        if (!doctor) {
            return res.status(404).json({ message: "Nie znaleziono lekarza" });
        }

        await AppDataSource.transaction(async (manager) => {
            await manager.delete(Visit, {doctor: { id: id } });

            await manager.delete(Doctor, { id: id });

            if(doctor.user) {
                await manager.delete(User, { id: doctor.user.id });
            }
        });
        
        res.json({ message: "Lekarz, jego konto oraz wszystkie przypisane wizyty zostały usunięte." });
    } catch (error) {
        console.error("Błąd usuwania lekarza:", error);
        res.status(500).json({ message: "Błąd serwera: " + error.message });
    }
});

// 3. Lista wszystkich pacjentów
router.get("/patients", requireRole("ADMIN"), async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [patients, total] = await patientRepo.findAndCount({
            take: limit,
            skip: skip,
            relations: ["user"], 
            order: { lastName: "ASC" }
        });

        const safePatients = patients.map(p => ({
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
            pesel: p.pesel,
            phoneNumber: p.phoneNumber,
            email: p.user ? p.user.email : null,
        }));

        res.json({
            data: safePatients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Błąd pobierania pacjentów:", error);
        res.status(500).json({ message: "Błąd serwera." });
    }
});

//4. Usuwanie pacjenta
router.delete("/patients/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const patient = await patientRepo.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!patient) {
            return res.status(404).json({ message: "Pacjent nie został znaleziony." });
        }

        await AppDataSource.transaction(async (manager) => {
            await manager.delete(Visit, { patient: { id: id } });

            await manager.delete(Patient, { id: id });

            if (patient.user) {
                await manager.delete(User, { id: patient.user.id });
            }
        });

        res.json({ message: "Pacjent i jego historia zostali usunięci z systemu." });

    } catch (error) {
        console.error("Błąd usuwania pacjenta:", error);
        res.status(500).json({ message: "Błąd serwera." });
    }
});

module.exports = router;