require("reflect-metadata");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { AppDataSource } = require("./data-source");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const visitRoutes = require("./routes/visitRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { authenticateToken, requireRole } = require("./middleware/authMiddleware");
const { createDefaultAdmin } = require("./seedAdmin"); 

const app = express();
const PORT = 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(bodyParser.json());



// Routing
app.use("/auth", authRoutes);
app.use("/api", authenticateToken, patientRoutes);
app.use("/visits", authenticateToken, visitRoutes);
app.use("/admin", authenticateToken, requireRole("ADMIN"), adminRoutes);

AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Baza danych podłączona!");


    await createDefaultAdmin(AppDataSource);


    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serwer działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Błąd połączenia z bazą danych:", err);

    process.exit(1); 
  });