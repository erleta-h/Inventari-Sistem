// modules/produkte/kategoria.service.js
const Kategoria = require("./kategoria.model");

module.exports = {
  create: async (data) => await Kategoria.create(data),
  getAll: async () => await Kategoria.findAll(),
  getById: async (id) => await Kategoria.findByPk(id),
  update: async (id, data) => {
    const k = await Kategoria.findByPk(id);
    if (!k) throw new Error("Kategoria nuk u gjet");
    await k.update(data);
    return k;
  },
  delete: async (id) => {
    const k = await Kategoria.findByPk(id);
    if (!k) throw new Error("Kategoria nuk u gjet");
    await k.destroy();
  }
};
