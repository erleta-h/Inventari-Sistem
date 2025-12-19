/**
 * Skript për debug të problemit të login-it
 * Kontrollon nëse përdoruesi dhe rolet ekzistojnë në databazë
 */

import { sequelize } from "./database";
import "../models/index";
import { Perdorues } from "../models/Perdorues";
import { Rol } from "../models/Rol";
import { PerdoruesRol } from "../models/PerdoruesRol";
import bcrypt from "bcryptjs";

async function debugLogin() {
  try {
    await sequelize.authenticate();
    console.log("✓ Lidhja me databazën u krijuar me sukses.\n");

    const email = "menaxher@inventari.com";

    // 1. Kontrollo nëse përdoruesi ekziston
    console.log(`1. Kontrollimi i përdoruesit: ${email}`);
    const perdorues = await Perdorues.findOne({ where: { email } });
    
    if (!perdorues) {
      console.log("❌ Përdoruesi nuk u gjet në databazë!");
      console.log("   Zgjidhje: Ekzekuto 'npm run setup' ose 'npm run seed' për të krijuar përdoruesit.");
      process.exit(1);
    }

    console.log(`✓ Përdoruesi u gjet: ID=${perdorues.id}, Emër=${perdorues.emer}, Aktiv=${perdorues.is_active}\n`);

    // 2. Kontrollo nëse përdoruesi ka rolet
    console.log("2. Kontrollimi i roleteve të përdoruesit...");
    const perdoruesMeRolet = await Perdorues.findByPk(perdorues.id, {
      include: [
        {
          model: Rol,
          as: "rolet",
          through: { attributes: [] },
        },
      ],
    });

    if (!perdoruesMeRolet) {
      console.log("❌ Përdoruesi nuk u gjet me rolet!");
      process.exit(1);
    }

    const rolet = (perdoruesMeRolet as any).rolet || [];
    
    if (rolet.length === 0) {
      console.log("❌ Përdoruesi nuk ka asnjë rol!");
      console.log("   Zgjidhje: Ekzekuto 'npm run setup' ose 'npm run seed' për të lidhur rolet me përdoruesin.");
      
      // Kontrollo nëse rolet ekzistojnë në databazë
      console.log("\n3. Kontrollimi i roleteve në databazë...");
      const teGjithaRolet = await Rol.findAll();
      console.log(`   Rolet në databazë: ${teGjithaRolet.length}`);
      teGjithaRolet.forEach(r => console.log(`   - ${r.name}`));
      
      if (teGjithaRolet.length === 0) {
        console.log("\n❌ Nuk ka rolet në databazë!");
        console.log("   Zgjidhje: Ekzekuto 'npm run setup' ose 'npm run seed' për të krijuar rolet.");
      } else {
        console.log("\n💡 Rolet ekzistojnë, por nuk janë lidhur me përdoruesin.");
        console.log("   Zgjidhje: Ekzekuto 'npm run seed' për të lidhur rolet me përdoruesin.");
      }
      
      process.exit(1);
    }

    console.log(`✓ Përdoruesi ka ${rolet.length} rol(e):`);
    rolet.forEach((r: any) => console.log(`   - ${r.name}`));
    console.log();

    // 3. Testo password
    console.log("3. Testimi i fjalëkalimit...");
    const testPassword = "menaxher123";
    const passwordValid = await bcrypt.compare(testPassword, perdorues.password_hash);
    
    if (passwordValid) {
      console.log("✓ Fjalëkalimi është i saktë.");
    } else {
      console.log("❌ Fjalëkalimi nuk përputhet!");
      console.log(`   Përdoruesi ka password_hash: ${perdorues.password_hash.substring(0, 20)}...`);
    }

    console.log("\n✅ Përdoruesi dhe rolet janë në rregull!");
    console.log("   Nëse login-i ende dështon, kontrollo server logs për më shumë detaje.");

    process.exit(0);
  } catch (err: any) {
    console.error("❌ Gabim në debug:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

debugLogin();

