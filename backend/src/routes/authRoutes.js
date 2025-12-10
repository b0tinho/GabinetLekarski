const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source");
const User = require("../entities/User");
const Patient = require("../entities/Patient");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const router = express.Router();
const userRepo = AppDataSource.getRepository(User);


// 1. REJESTRACJA PACJENTA (Publiczna)
router.post("/register/patient", async (req, res) => {
  const { email, password, firstName, lastName, pesel, phoneNumber } = req.body;


  if (!email || !password || !firstName || !lastName || !pesel) {
    return res.status(400).json({ message: "Wypełnij wszystkie wymagane pola." });
  }

  try {

    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Ten email jest już zajęty." });
    }


    const existingPatient = await AppDataSource.getRepository(Patient).findOneBy({ pesel });
    if (existingPatient) {
      return res.status(409).json({ message: "Pacjent o podanym numerze PESEL już istnieje." });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    await AppDataSource.transaction(async (manager) => {

      const newUser = manager.create(User, {
        email,
        password: hashedPassword,
        role: "PATIENT", 
      });
      const savedUser = await manager.save(newUser);

      const newPatient = manager.create(Patient, {
        firstName,
        lastName,
        pesel,
        phoneNumber,
        user: savedUser,
      });
      await manager.save(newPatient);
    });

    res.status(201).json({ message: "Konto pacjenta zostało utworzone. Możesz się zalogować." });

  } catch (error) {
    console.error("Błąd rejestracji:", error);
    res.status(500).json({ message: "Wystąpił błąd serwera podczas rejestracji." });
  }
});


// 2. LOGOWANIE (Dla Pacjenta, Lekarza i Admina)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Podaj email i hasło." });
  }

  try {

    const user = await userRepo.findOneBy({ email });

    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło." });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło." });
    }


    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: "4h" }
    );


    res.json({
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Błąd logowania:", error);
    res.status(500).json({ message: "Wystąpił błąd serwera." });
  }
});

module.exports = router;