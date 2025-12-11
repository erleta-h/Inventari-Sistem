const Product = require("../modules/produktet/produkt.model");
const Depo = require("../modules/depo/depo.model");
const Inventory = require("../modules/inventari/inventari.model");
const Kategoria = require("../modules/produktet/kategoria.model");
const NjesiaMatese = require("../modules/produktet/njesiaMatese.model");


// 1 Produkt ---∞ Inventar
Product.hasMany(Inventory, { foreignKey: "produktiId" });
Inventory.belongsTo(Product, { foreignKey: "produktiId" });

// 1 Depo ---∞ Inventar
Depo.hasMany(Inventory, { foreignKey: "depoId" });
Inventory.belongsTo(Depo, { foreignKey: "depoId" });


Kategoria.hasMany(Product, { foreignKey: "KategoriaID" });
Product.belongsTo(Kategoria, { foreignKey: "KategoriaID"});

NjesiaMatese.hasMany(Product, { foreignKey: "ID_Njesia"});
Product.belongsTo(NjesiaMatese, { foreignKey: "ID_Njesia" });

module.exports = { Product, Depo, Inventory, Kategoria, NjesiaMatese };
