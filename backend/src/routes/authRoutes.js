const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source");
const User = require("../entities/User");
const Patient = require("../entities/Patient");
const Doctor = require("../entities/Doctor");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const router = express.Router();
const userRepo = AppDataSource.getRepository(User);
const patientRepo = AppDataSource.getRepository(Patient);
const doctorRepo = AppDataSource.getRepository(Doctor);

// REJESTRACJA PACJENTA
router.post("/register/patient", async (req, res) => {
  try {
    const { email, password, firstName, lastName, pesel, phoneNumber } = req.body;


    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) return res.status(400).json({ message: "Email zajęty" });


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = userRepo.create({
      email,
      password: hashedPassword,
      role: "PATIENT"
    });
    const savedUser = await userRepo.save(newUser);


    const newPatient = patientRepo.create({
      firstName, lastName, pesel, phoneNumber,
      user: savedUser
    });
    await patientRepo.save(newPatient);

    res.status(201).json({ message: "Konto pacjenta utworzone" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REJESTRACJA LEKARZA (uproszczona, bez weryfikacji uprawnień admina)
router.post("/register/doctor", async (req, res) => {
  try {
    const { email, password, firstName, lastName, specialization } = req.body;
    
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) return res.status(400).json({ message: "Email zajęty" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      email,
      password: hashedPassword,
      role: "DOCTOR"
    });
    const savedUser = await userRepo.save(newUser);

    const newDoctor = doctorRepo.create({
      firstName, lastName, specialization,
      user: savedUser
    });
    await doctorRepo.save(newDoctor);

    res.status(201).json({ message: "Konto lekarza utworzone" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGOWANIE (Wspólne dla wszystkich)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    

    const user = await userRepo.findOneBy({ email });
    if (!user) return res.status(400).json({ message: "Nieprawidłowe dane logowania" });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Nieprawidłowe dane logowania" });


    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;