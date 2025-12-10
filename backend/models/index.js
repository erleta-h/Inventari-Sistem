const Product = require("../modules/produktet/produkt.model");
const Depo = require("../modules/depo/depo.model");
const Inventory = require("../modules/inventari/inventari.model");

// 1 Produkt ---∞ Inventar
Product.hasMany(Inventory, { foreignKey: "produktiId" });
Inventory.belongsTo(Product, { foreignKey: "produktiId" });

// 1 Depo ---∞ Inventar
Depo.hasMany(Inventory, { foreignKey: "depoId" });
Inventory.belongsTo(Depo, { foreignKey: "depoId" });

module.exports = { Product, Depo, Inventory };
