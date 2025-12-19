import { sequelize } from "./database";

async function updatePorosiStatusEnum() {
  try {
    await sequelize.authenticate();
    console.log("Lidhja me databazën u krijuar me sukses.");

    const dbName = sequelize.getDatabaseName();

    // Kontrollo vlerat aktuale të ENUM-it
    const [enumInfo] = await sequelize.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${dbName}'
        AND TABLE_NAME = 'porosite'
        AND COLUMN_NAME = 'status'
    `) as any[];

    if (enumInfo && enumInfo.length > 0) {
      const currentEnum = enumInfo[0].COLUMN_TYPE;
      console.log("ENUM aktual:", currentEnum);
      
      // Kontrollo nëse READY_FOR_SHIPPING ekziston
      if (currentEnum.includes("READY_FOR_SHIPPING")) {
        console.log("✓ ENUM-i tashmë ka vlerat e duhura.");
        return;
      }
    }

    console.log("Duke përditësuar ENUM-in për kolonën status në tabelën porosite...");

    // Përditëso ENUM-in
    await sequelize.query(`
      ALTER TABLE porosite 
      MODIFY COLUMN status ENUM(
        'DRAFT',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_SHIPPING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'FAILED'
      ) NOT NULL DEFAULT 'DRAFT'
    `);

    console.log("✓ ENUM-i u përditësua me sukses!");
  } catch (error: any) {
    console.error("Gabim në përditësimin e ENUM-it:", error.message);
    throw error;
  }
}

// Ekzekuto nëse skripti thirret direkt
if (require.main === module) {
  updatePorosiStatusEnum()
    .then(() => {
      console.log("Migration u krye me sukses!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration dështoi:", err);
      process.exit(1);
    });
}

export { updatePorosiStatusEnum };

