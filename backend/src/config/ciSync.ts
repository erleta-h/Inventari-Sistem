import { sequelize } from "./database";
import "../models/index";

async function sync() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  console.log("Schema synced for CI.");
  process.exit(0);
}

sync().catch((e) => {
  console.error(e);
  process.exit(1);
});
