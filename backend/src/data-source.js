const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASS || "admin123",
  database: process.env.DB_NAME || "gabinet_db",
  synchronize: true, // Tylko na dev!
  logging: false,
  entities: [__dirname + "/entities/*.js"],
});

module.exports = { AppDataSource };