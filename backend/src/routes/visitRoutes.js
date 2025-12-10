const express = require("express");
const { AppDataSource } = require("../data-source");
const Visit = require("../entities/Visit");
const Doctor = require("../entities/Doctor");
const Patient = require("../entities/Patient");
const router = express.Router();
const visitRepo = AppDataSource.getRepository(Visit);

// 1. Pobierz Wizyty (Inteligentne filtrowanie)
router.get("/", async (req, res) => {
    try {
        const user = req.user; 
        const whereClause = {};

        
        if (user.role === 'PATIENT') {
            const patient = await AppDataSource.getRepository(Patient).findOneBy({ user: { id: user.id } });
            whereClause.patient = { id: patient.id };
        }
        
        else if (user.role === 'DOCTOR') {
            const doctor = await AppDataSource.getRepository(Doctor).findOneBy({ user: { id: user.id } });
            whereClause.doctor = { id: doctor.id };
        }
        

        const visits = await visitRepo.find({
            where: whereClause,
            relations: ["patient", "doctor"], 
            order: { date: "ASC" }
        });

        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Edycja Wizyty (Zmiana statusu lub opisu)
router.patch("/:id", async (req, res) => {
    try {
        const { status, description } = req.body;
        const visit = await visitRepo.findOneBy({ id: req.params.id });

        if (!visit) return res.status(404).json({ message: "Wizyta nie istnieje" });

        
        
        if (req.user.role === 'PATIENT' && status === 'CANCELLED') {
             visit.status = 'CANCELLED';
        } 
        else if (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN') {
             if (status) visit.status = status;
             if (description) visit.description = description;
        } else {
             return res.status(403).json({ message: "Brak uprawnień do tej zmiany" });
        }

        await visitRepo.save(visit);
        res.json(visit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;