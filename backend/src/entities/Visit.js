const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Visit", tableName: "visits",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    date: { type: "timestamp" },
    description: { type: "text", nullable: true },
    status: { type: "enum", enum: ["PLANNED", "COMPLETED", "CANCELLED"], default: "PLANNED" }
  },
  relations: {
    patient: { target: "Patient", type: "many-to-one", joinColumn: { name: "patientId" }, inverseSide: "visits" },
    doctor: { target: "Doctor", type: "many-to-one", joinColumn: { name: "doctorId" }, inverseSide: "visits" }
  }
});