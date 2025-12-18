import { sequelize } from "./database";
import "../models/index";
import { Perdorues } from "../models/Perdorues";
import { Rol, RoleName } from "../models/Rol";
import { PerdoruesRol } from "../models/PerdoruesRol";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Lidhja me databazën u krijuar me sukses.");

    // Krijo rolet nëse nuk ekzistojnë
    const rolet = [
      { name: RoleName.ADMIN, description: "Administrator - akses i plotë" },
      { name: RoleName.MENAXHER, description: "Menaxher - menaxhim i plotë" },
      { name: RoleName.MAGAZINIER, description: "Magazinier - menaxhim i inventarit" },
      { name: RoleName.SHITES, description: "Shitës - krijim dhe menaxhim i porosive" },
      { name: RoleName.SHOFER, description: "Shofer - menaxhim i dërgesave" },
    ];

    for (const rolData of rolet) {
      const [rol, created] = await Rol.findOrCreate({
        where: { name: rolData.name },
        defaults: rolData,
      });
      if (created) {
        console.log(`Roli ${rolData.name} u krijua.`);
      } else {
        console.log(`Roli ${rolData.name} ekzistonte tashmë.`);
      }
    }

    // Krijo përdorues admin nëse nuk ekziston
    const adminEmail = "admin@inventari.com";
    const adminPassword = "admin123";

    const existingAdmin = await Perdorues.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const admin = await Perdorues.create({
        emer: "Administrator",
        email: adminEmail,
        password_hash: passwordHash,
        telefoni: null,
        is_active: true,
      });

      // Cakto rolin ADMIN
      const adminRol = await Rol.findOne({ where: { name: RoleName.ADMIN } });
      if (adminRol) {
        await PerdoruesRol.create({
          perdorues_id: admin.id,
          rol_id: adminRol.id,
        });
        console.log(`Përdoruesi admin u krijua me sukses!`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Fjalëkalim: ${adminPassword}`);
      }
    } else {
      console.log(`Përdoruesi admin ekzistonte tashmë me email: ${adminEmail}`);
    }

    // Krijo përdorues menaxher për testim
    const menaxherEmail = "menaxher@inventari.com";
    const menaxherPassword = "menaxher123";

    const existingMenaxher = await Perdorues.findOne({ where: { email: menaxherEmail } });

    if (!existingMenaxher) {
      const passwordHash = await bcrypt.hash(menaxherPassword, 10);
      const menaxher = await Perdorues.create({
        emer: "Menaxher Test",
        email: menaxherEmail,
        password_hash: passwordHash,
        telefoni: null,
        is_active: true,
      });

      // Cakto rolin MENAXHER
      const menaxherRol = await Rol.findOne({ where: { name: RoleName.MENAXHER } });
      if (menaxherRol) {
        await PerdoruesRol.create({
          perdorues_id: menaxher.id,
          rol_id: menaxherRol.id,
        });
        console.log(`Përdoruesi menaxher u krijua me sukses!`);
        console.log(`Email: ${menaxherEmail}`);
        console.log(`Fjalëkalim: ${menaxherPassword}`);
      }
    } else {
      console.log(`Përdoruesi menaxher ekzistonte tashmë me email: ${menaxherEmail}`);
    }

    // Krijo përdorues magazinier për testim
    const magazinierEmail = "magazinier@inventari.com";
    const magazinierPassword = "magazinier123";

    const existingMagazinier = await Perdorues.findOne({ where: { email: magazinierEmail } });

    if (!existingMagazinier) {
      const passwordHash = await bcrypt.hash(magazinierPassword, 10);
      const magazinier = await Perdorues.create({
        emer: "Magazinier Test",
        email: magazinierEmail,
        password_hash: passwordHash,
        telefoni: null,
        is_active: true,
      });

      // Cakto rolin MAGAZINIER
      const magazinierRol = await Rol.findOne({ where: { name: RoleName.MAGAZINIER } });
      if (magazinierRol) {
        await PerdoruesRol.create({
          perdorues_id: magazinier.id,
          rol_id: magazinierRol.id,
        });
        console.log(`Përdoruesi magazinier u krijua me sukses!`);
        console.log(`Email: ${magazinierEmail}`);
        console.log(`Fjalëkalim: ${magazinierPassword}`);
      }
    } else {
      console.log(`Përdoruesi magazinier ekzistonte tashmë me email: ${magazinierEmail}`);
    }

    // Krijo përdorues shitës për testim
    const shitesEmail = "shites@inventari.com";
    const shitesPassword = "shites123";

    const existingShites = await Perdorues.findOne({ where: { email: shitesEmail } });

    if (!existingShites) {
      const passwordHash = await bcrypt.hash(shitesPassword, 10);
      const shites = await Perdorues.create({
        emer: "Shitës Test",
        email: shitesEmail,
        password_hash: passwordHash,
        telefoni: null,
        is_active: true,
      });

      // Cakto rolin SHITES
      const shitesRol = await Rol.findOne({ where: { name: RoleName.SHITES } });
      if (shitesRol) {
        await PerdoruesRol.create({
          perdorues_id: shites.id,
          rol_id: shitesRol.id,
        });
        console.log(`Përdoruesi shitës u krijua me sukses!`);
        console.log(`Email: ${shitesEmail}`);
        console.log(`Fjalëkalim: ${shitesPassword}`);
      }
    } else {
      console.log(`Përdoruesi shitës ekzistonte tashmë me email: ${shitesEmail}`);
    }

    // Krijo përdorues shofer për testim
    const shoferEmail = "shofer@inventari.com";
    const shoferPassword = "shofer123";

    const existingShofer = await Perdorues.findOne({ where: { email: shoferEmail } });

    if (!existingShofer) {
      const passwordHash = await bcrypt.hash(shoferPassword, 10);
      const shofer = await Perdorues.create({
        emer: "Shofer Test",
        email: shoferEmail,
        password_hash: passwordHash,
        telefoni: "+355 69 123 4567",
        is_active: true,
      });

      // Cakto rolin SHOFER
      const shoferRol = await Rol.findOne({ where: { name: RoleName.SHOFER } });
      if (shoferRol) {
        await PerdoruesRol.create({
          perdorues_id: shofer.id,
          rol_id: shoferRol.id,
        });
        console.log(`Përdoruesi shofer u krijua me sukses!`);
        console.log(`Email: ${shoferEmail}`);
        console.log(`Fjalëkalim: ${shoferPassword}`);
      }
    } else {
      console.log(`Përdoruesi shofer ekzistonte tashmë me email: ${shoferEmail}`);
    }

    // Krijo përdorues shofer i dytë për testim
    const shofer2Email = "shofer2@inventari.com";
    const shofer2Password = "shofer2123";

    const existingShofer2 = await Perdorues.findOne({ where: { email: shofer2Email } });

    if (!existingShofer2) {
      const passwordHash = await bcrypt.hash(shofer2Password, 10);
      const shofer2 = await Perdorues.create({
        emer: "Shofer Test 2",
        email: shofer2Email,
        password_hash: passwordHash,
        telefoni: "+355 69 123 4568",
        is_active: true,
      });

      // Cakto rolin SHOFER
      const shoferRol = await Rol.findOne({ where: { name: RoleName.SHOFER } });
      if (shoferRol) {
        await PerdoruesRol.create({
          perdorues_id: shofer2.id,
          rol_id: shoferRol.id,
        });
        console.log(`Përdoruesi shofer 2 u krijua me sukses!`);
        console.log(`Email: ${shofer2Email}`);
        console.log(`Fjalëkalim: ${shofer2Password}`);
      }
    } else {
      console.log(`Përdoruesi shofer 2 ekzistonte tashmë me email: ${shofer2Email}`);
    }

    console.log("\n=== Seed u krye me sukses! ===");
    console.log("\nKredencialet për testim:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ADMIN:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Fjalëkalim: ${adminPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MENAXHER:");
    console.log(`  Email: ${menaxherEmail}`);
    console.log(`  Fjalëkalim: ${menaxherPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MAGAZINIER:");
    console.log(`  Email: ${magazinierEmail}`);
    console.log(`  Fjalëkalim: ${magazinierPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("SHITES:");
    console.log(`  Email: ${shitesEmail}`);
    console.log(`  Fjalëkalim: ${shitesPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("SHOFER:");
    console.log(`  Email: ${shoferEmail}`);
    console.log(`  Fjalëkalim: ${shoferPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("SHOFER 2:");
    console.log(`  Email: ${shofer2Email}`);
    console.log(`  Fjalëkalim: ${shofer2Password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (err) {
    console.error("Seed dështoi:", err);
    process.exit(1);
  }
}

seed();