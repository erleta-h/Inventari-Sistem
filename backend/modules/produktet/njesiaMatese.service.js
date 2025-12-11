// modules/produkte/njesiaMatese.service.js
const NjesiaMatese = require("./njesiaMatese.model");

module.exports = {
  create: async (data) => await NjesiaMatese.create(data),
  getAll: async () => await NjesiaMatese.findAll(),
  getById: async (id) => await NjesiaMatese.findByPk(id),
  update: async (id, data) => {
    const n = await NjesiaMatese.findByPk(id);
    if (!n) throw new Error("Njësia nuk u gjet");
    await n.update(data);
    return n;
  },
  delete: async (id) => {
    const n = await NjesiaMatese.findByPk(id);
    if (!n) throw new Error("Njësia nuk u gjet");
    await n.destroy();
  }
};
