const bcrypt = require("bcryptjs");
const User = require("./entities/User");

const createDefaultAdmin = async (dataSource) => {
  try {
    const userRepo = dataSource.getRepository(User);

    
    const existingAdmin = await userRepo.findOneBy({ role: "ADMIN" });
    if (existingAdmin) {
      console.log("ℹ️  Admin już istnieje - pomijam tworzenie.");
      return; 
    }

    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gabinet.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = userRepo.create({
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    });

    await userRepo.save(admin);
    
    console.log("✅ Domyślne konto ADMINA zostało utworzone automatycznie.");
    console.log(`   Login: ${adminEmail}`);
    console.log(`   Pass:  ${adminPassword}`);

  } catch (error) {
    console.error("❌ Błąd podczas tworzenia admina:", error);
    
  }
};

module.exports = { createDefaultAdmin };