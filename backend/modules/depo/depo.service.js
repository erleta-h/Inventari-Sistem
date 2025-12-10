const Depo = require("./depo.model");

module.exports = {
  async krijo(data) {
    return await Depo.create(data);
  },

  async merrTeGjitha() {
    return await Depo.findAll();
  },

  async merrSipasId(id) {
    return await Depo.findByPk(id);
  },

  async perditeso(id, data) {
    return await Depo.update(data, { where: { depoId: id } });
  },

  async fshij(id) {
    return await Depo.destroy({ where: { depoId: id } });
  }
};
