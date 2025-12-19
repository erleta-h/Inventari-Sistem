import { sequelize } from "./database";
// Import i modeleve për të inicializuar asociacionet
import "../models/index";

async function migrate() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    // eslint-disable-next-line no-console
    console.log("Migrimi (sync) u krye me sukses");
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Migrimi dështoi:", err);
    process.exit(1);
  }
}

migrate();







