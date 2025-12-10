const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Brak tokenu" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Nieprawidłowy token" });
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Użytkownik niezweryfikowany." });
    }


    if (req.user.role === role) {
      next(); 
    } else {
      res.status(403).json({ 
        message: `Brak uprawnień. Wymagana rola: ${role}, Twoja rola: ${req.user.role}` 
      });
    }
  };
};

module.exports = { authenticateToken, requireRole, JWT_SECRET };