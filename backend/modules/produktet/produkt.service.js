const Produkti = require("./produkt.model");

module.exports = {
  async krijoProdukt(data) {
    return await Produkti.create(data);
  },

  async merrTeGjithe() {
    return await Produkti.findAll();
  },

  async merrSipasId(id) {
    return await Produkti.findByPk(id);
  },

  async perditeso(id, data) {
    return await Produkti.update(data, { where: { produktiId: id } });
  },

  async fshij(id) {
    return await Produkti.destroy({ where: { produktiId : id } });
  }
};
