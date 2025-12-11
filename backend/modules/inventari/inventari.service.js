const Inventory = require("./inventari.model");
const Product = require("../produktet/produkt.model");
const Depo = require("../depo/depo.model");

module.exports = {
  async krijo(data) {
    return await Inventory.create(data);
  },

  async merrTeGjitha() {
    return await Inventory.findAll({
      include: [
        { model: Product },
        { model: Depo }
      ]
    });
  },

  async merrSipasId(id) {
    return await Inventory.findByPk(id, {
      include: [
        { model: Product },
        { model: Depo }
      ]
    });
  },

  async perditeso(id, data) {
    return await Inventory.update(data, { where: { inventariId } });
  },

  async fshij(id) {
    return await Inventory.destroy({ where: { inventariId } });
  }
};
