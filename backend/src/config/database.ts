import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "mysql",
    logging: env.server.nodeEnv === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Lidhja me databazën u krijuar me sukses.");
  } catch (error) {
    console.error("Gabim në lidhjen me databazën:", error);
    throw error;
  }
};






