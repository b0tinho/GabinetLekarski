require("reflect-metadata");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { AppDataSource } = require("./data-source");
const authRoutes = require("./routes/authRoutes");
const { authenticateToken } = require("./middleware/authMiddleware");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(bodyParser.json());

// Inicjalizacja bazy
AppDataSource.initialize()
  .then(() => console.log("Baza danych podłączona!"))
  .catch((err) => console.error("Błąd bazy danych:", err));

// Trasy publiczne
app.use("/auth", authRoutes);



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend działa na porcie ${PORT}`);
});