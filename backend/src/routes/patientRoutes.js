const express = require("express");
const { AppDataSource } = require("../data-source");
const Doctor = require("../entities/Doctor");
const Visit = require("../entities/Visit");
const Patient = require("../entities/Patient");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 1. Lista Lekarzy (Publiczna - każdy może zobaczyć)
router.get("/doctors", async (req, res) => {
    const doctors = await AppDataSource.getRepository(Doctor).find();
    
    const result = doctors.map(d => ({
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        specialization: d.specialization
    }));
    res.json(result);
});

// 2. Umówienie wizyty (Tylko zalogowany pacjent)
router.post("/book", authenticateToken, async (req, res) => {
    const { doctorId, date } = req.body; 

    
    try {
        const visitRepo = AppDataSource.getRepository(Visit);

        
        const existingVisit = await visitRepo.createQueryBuilder("visit")
            .where("visit.doctorId = :doctorId", { doctorId })
            .andWhere("visit.date = :date", { date })
            .andWhere("visit.status != 'CANCELLED'")
            .getOne();

        if (existingVisit) {
            return res.status(409).json({ message: "Ten termin jest już zajęty." });
        }


        const patient = await AppDataSource.getRepository(Patient).findOneBy({ user: { id: req.user.id } });
        if (!patient) return res.status(403).json({ message: "Błąd profilu pacjenta" });

        const newVisit = visitRepo.create({
            date: date,
            doctor: { id: doctorId }, 
            patient: patient,
            status: "PLANNED"
        });

        await visitRepo.save(newVisit);
        res.status(201).json({ message: "Wizyta zarezerwowana!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;