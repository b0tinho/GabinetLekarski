const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Doctor", tableName: "doctors",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    firstName: { type: "varchar" },
    lastName: { type: "varchar" },
    specialization: { type: "varchar" }
  },
  relations: {
    user: { target: "User", type: "one-to-one", joinColumn: { name: "userId" }, cascade: true },
    visits: { target: "Visit", type: "one-to-many", inverseSide: "doctor" }
  },
});