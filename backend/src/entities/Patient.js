const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Patient", tableName: "patients",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    firstName: { type: "varchar" },
    lastName: { type: "varchar" },
    pesel: { type: "varchar", unique: true, length: 11 },
    phoneNumber: { type: "varchar", nullable: true }
  },
  relations: {
    user: { target: "User", type: "one-to-one", joinColumn: { name: "userId" }, cascade: true },
    visits: { target: "Visit", type: "one-to-many", inverseSide: "patient", cascade: true }
  }
});