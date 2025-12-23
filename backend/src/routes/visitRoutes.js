const express = require("express");
const { AppDataSource } = require("../data-source");
const Visit = require("../entities/Visit");
const Doctor = require("../entities/Doctor");
const Patient = require("../entities/Patient");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();
const visitRepo = AppDataSource.getRepository(Visit);

// 1. Pobierz Wizyty (Inteligentne filtrowanie)
router.get("/", async (req, res) => {
    try {
        const user = req.user;
        const { role, id: userId } = req.user;
        const { page = 1, limit = 10, status } = req.query;

        const skip = (page - 1) * limit; 
        const whereClause = {};

        if (status) whereClause.status = status;

        if (role === 'PATIENT') {
            const patient = await AppDataSource.getRepository(Patient).findOneBy({ user: { id: user.id } });
            if (!patient) return res.status(404).json({ message: "Profil pacjenta nie istnieje" });
            whereClause.patient = { id: patient.id };
        }
        
        else if (role === 'DOCTOR') {
            const doctor = await AppDataSource.getRepository(Doctor).findOneBy({ user: { id: user.id } });
            if (!doctor) return res.status(404).json({ message: "Profil lekarza nie istnieje" });
            whereClause.doctor = { id: doctor.id };
        }
        

        const [visits, total] = await visitRepo.findAndCount({
            where: whereClause,
            relations: ["patient", "doctor"],
            order: { date: "DESC" },
            take: parseInt(limit),
            skip: parseInt(skip)
        });

        res.json({
            data: visits,
            meta: {
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Edycja Wizyty (Zmiana statusu lub opisu)
router.patch("/:id", authenticateToken, async (req, res) => {
    try {
        const { status, description, date, doctorId } = req.body;
        const visit = await visitRepo.findOne({ 
            where: { id: req.params.id },
            relations: ["patient", "doctor"]
        });

        if (!visit) return res.status(404).json({ message: "Wizyta nie istnieje" });

        const userRole = req.user.role;
        
        if (userRole === 'PATIENT') {
            if (status === 'CANCELLED') {
                visit.status = 'CANCELLED';
            } else {
                return res.status(403).json({ message: "Pacjent może tylko odwołać wizytę." });
            }
        }
        else if (userRole === 'DOCTOR') {
            if (status) visit.status = status;
            if (description) visit.description = description;
        } 

        else if (userRole === 'ADMIN') {
            if (status) visit.status = status;
            if (description) visit.description = description;
            if (date) visit.date = date;
            if (doctorId) visit.doctor = { id: doctorId };
        }

        const updatedVisit = await visitRepo.save(visit);
        res.json(updatedVisit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Usuwanie wizyt
router.delete("/:id", authenticateToken, requireRole("ADMIN"), async (req, res) => {
    try {
        const result = await visitRepo.delete(req.params.id);
        
        if (result.affected === 0) {
            return res.status(404).json({ message: "Wizyta nie istnieje" });
        }

        res.json({ message: "Wizyta została trwale usunięta z bazy danych." });
    } catch (error) {
        console.error("Błąd usuwania wizyty:", error);
        res.status(500).json({ message: "Błąd serwera podczas usuwania wizyty." });
    }
});

module.exports = router;