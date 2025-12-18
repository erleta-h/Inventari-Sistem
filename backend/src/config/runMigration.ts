import { sequelize } from "./database";

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log("Lidhja me databazën u krijuar me sukses.");

    const dbName = sequelize.getDatabaseName();

    // Kontrollo nëse kolona parapagesa ekziston
    const [parapagesaExists] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${dbName}'
        AND TABLE_NAME = 'porosite'
        AND COLUMN_NAME = 'parapagesa'
    `) as any[];

    if ((parapagesaExists[0] as any).count === 0) {
      console.log("Duke shtuar kolonën parapagesa...");
      await sequelize.query(`
        ALTER TABLE porosite 
        ADD COLUMN parapagesa DECIMAL(10, 2) DEFAULT 0
      `);
      console.log("Kolona parapagesa u shtua me sukses.");
    } else {
      console.log("Kolona parapagesa ekziston tashmë.");
    }

    // Kontrollo nëse kolona shuma_paguar ekziston
    const [shumaPaguarExists] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${dbName}'
        AND TABLE_NAME = 'porosite'
        AND COLUMN_NAME = 'shuma_paguar'
    `) as any[];

    if ((shumaPaguarExists[0] as any).count === 0) {
      console.log("Duke shtuar kolonën shuma_paguar...");
      await sequelize.query(`
        ALTER TABLE porosite 
        ADD COLUMN shuma_paguar DECIMAL(10, 2) DEFAULT 0
      `);
      console.log("Kolona shuma_paguar u shtua me sukses.");
    } else {
      console.log("Kolona shuma_paguar ekziston tashmë.");
    }

    // Përditëso shuma_paguar për porositë ekzistuese
    await sequelize.query(`
      UPDATE porosite
      SET shuma_paguar = COALESCE(parapagesa, 0)
      WHERE shuma_paguar IS NULL OR shuma_paguar = 0
    `);

    console.log("Migrimi u ekzekutua me sukses!");
    process.exit(0);
  } catch (err) {
    console.error("Gabim në ekzekutimin e migrimit:", err);
    process.exit(1);
  }
}

runMigration();