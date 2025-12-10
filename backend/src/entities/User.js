const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "User", tableName: "users",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    email: { type: "varchar", unique: true },
    password: { type: "varchar" },
    role: { type: "enum", enum: ["PATIENT", "DOCTOR", "ADMIN"], default: "PATIENT" }
  }
});