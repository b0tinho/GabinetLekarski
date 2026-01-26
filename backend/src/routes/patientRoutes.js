const express = require("express");
const { AppDataSource } = require("../data-source");
const Doctor = require("../entities/Doctor");
const Visit = require("../entities/Visit");
const Patient = require("../entities/Patient");
const { authenticateToken } = require("../middleware/authMiddleware");
const { ILike } = require("typeorm");

const router = express.Router();

const doctorRepo = AppDataSource.getRepository(Doctor);

// 1. Lista Lekarzy (Publiczna - każdy może zobaczyć)
router.get("/doctors", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { specialization } = req.query;
        const whereClause = {};

        if (specialization) {
            whereClause.specialization = ILike(`%${specialization}%`);
        }

        const [doctors, total] = await doctorRepo.findAndCount({
            take: limit,
            skip: skip,
            where: whereClause,
            relations: ["user"], 
            order: { lastName: "ASC" }
        });

        const safeDoctors = doctors.map(d => ({
            id: d.id,
            firstName: d.firstName,
            lastName: d.lastName,
            specialization: d.specialization, 
            email: d.user ? d.user.email : null,
        }));

        res.json({
            data: safeDoctors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    }   catch(error) {
        console.error("Blad pobierania lekarzy:", error);
        res.status(500).json({ message: "Blad serwera podczas pobierania listy lekarzy." });
    }
});

// 2. UMAWIANIE WIZYTY (Z pełną walidacją kolizji)
router.post("/book", authenticateToken, async (req, res) => {
    const { doctorId, date } = req.body; 

    if (!doctorId || !date) {
        return res.status(400).json({ message: "Brak lekarza lub daty." });
    }

    try {
        const visitRepo = AppDataSource.getRepository(Visit);

        
        const patient = await AppDataSource.getRepository(Patient).findOneBy({ user: { id: req.user.id } });
        if (!patient) return res.status(403).json({ message: "Nie znaleziono profilu pacjenta." });

       
        const patientConflict = await visitRepo.createQueryBuilder("visit")
            .where("visit.patientId = :patientId", { patientId: patient.id })
            .andWhere("visit.date = :date", { date })
            .andWhere("visit.status != :status", { status: "CANCELLED" })
            .getOne();

        if (patientConflict) {
            return res.status(409).json({ 
                message: "Masz już umówioną wizytę w tym terminie u innego lekarza!" 
            });
        }

        
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

       
        const doctor = await AppDataSource.getRepository(Doctor).findOneBy({ id: doctorId });
        if (!doctor) return res.status(404).json({ message: "Nie znaleziono lekarza." });

        const newVisit = visitRepo.create({
            date: date,
            status: "PLANNED",
            patient: patient,
            doctor: doctor
        });

        await visitRepo.save(newVisit);
        
        res.status(201).json({ message: "Wizyta została pomyślnie zarezerwowana." });

    } catch (error) {
        console.error("Błąd rezerwacji:", error);
        res.status(500).json({ message: "Błąd serwera." });
    }
});

module.exports = router;