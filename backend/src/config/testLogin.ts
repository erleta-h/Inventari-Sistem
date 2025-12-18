import { sequelize } from "./database";
import "../models/index";
import { Perdorues } from "../models/Perdorues";
import { PerdoruesRepository } from "../repositories/PerdoruesRepository";
import bcrypt from "bcryptjs";

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log("Lidhja me databazën u krijuar me sukses.");

    const email = "admin@inventari.com";
    const password = "admin123";

    // Kontrollo nëse përdoruesi ekziston
    const perdorues = await Perdorues.findOne({ 
      where: { email },
      paranoid: false // Kontrollo edhe të fshirët
    });

    if (!perdorues) {
      console.log(`❌ Përdoruesi me email ${email} nuk u gjet!`);
      console.log("💡 Ekzekuto: npm run seed");
      process.exit(1);
    }

    console.log(`✅ Përdoruesi u gjet:`);
    console.log(`   ID: ${perdorues.id}`);
    console.log(`   Emër: ${perdorues.emer}`);
    console.log(`   Email: ${perdorues.email}`);
    console.log(`   Aktiv: ${perdorues.is_active}`);
    console.log(`   I fshirë: ${perdorues.deleted_at ? 'Po' : 'Jo'}`);

    // Testo fjalëkalimin
    const passwordValid = await bcrypt.compare(password, perdorues.password_hash);
    
    if (!passwordValid) {
      console.log(`❌ Fjalëkalimi nuk përputhet!`);
      console.log(`   Hash i ruajtur: ${perdorues.password_hash.substring(0, 20)}...`);
      process.exit(1);
    }

    console.log(`✅ Fjalëkalimi është i saktë!`);

    // Kontrollo rolet
    const repository = new PerdoruesRepository();
    const perdoruesMeRolet = await repository.gjejMeRolet(perdorues.id);

    if (!perdoruesMeRolet) {
      console.log(`❌ Përdoruesi nuk u gjet me rolet!`);
      process.exit(1);
    }

    const rolet = (perdoruesMeRolet as any).rolet || [];
    console.log(`✅ Rolet:`);
    if (rolet.length === 0) {
      console.log(`   ⚠️  Përdoruesi nuk ka role!`);
      console.log("💡 Ekzekuto: npm run seed");
    } else {
      rolet.forEach((rol: any) => {
        console.log(`   - ${rol.name}`);
      });
    }

    console.log("\n✅ Testi u krye me sukses! Kredencialet janë të sakta.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Tes ti dështoi:", err);
    process.exit(1);
  }
}

testLogin();