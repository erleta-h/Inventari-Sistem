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
  const produkti = await Produkti.findByPk(id);
  if (!produkti) throw new Error("Produkti nuk u gjet");
  await produkti.update(data);
  return produkti;
}
,

  async fshij(id) {
    return await Produkti.destroy({ where: { produktiId : id } });
  }
};
