const express = require("express");
const bcrypt = require("bcryptjs");
const { AppDataSource } = require("../data-source");
const User = require("../entities/User");
const Doctor = require("../entities/Doctor");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();


const userRepo = AppDataSource.getRepository(User);
const doctorRepo = AppDataSource.getRepository(Doctor);

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
    try {
        const doctor = await doctorRepo.findOne({ 
            where: { id: req.params.id }, 
            relations: ["user"] 
        });

        if (!doctor) {
            return res.status(404).json({ message: "Nie znaleziono lekarza" });
        }

        await userRepo.remove(doctor.user);
        
        res.json({ message: "Lekarz i jego konto usunięte" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;