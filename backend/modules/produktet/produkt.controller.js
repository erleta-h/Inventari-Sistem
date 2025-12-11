const productService = require("./produkt.service");
const { productSchema } = require("./produkt.validation");
const Produkti = require("./produkt.model");
const Kategoria = require("./kategoria.model");
const NjesiaMatese = require("./njesiaMatese.model");
const Inventory = require("../inventari/inventari.model"); // varësisht ku e ke


module.exports = {
  create: async (req, res) => {
    try {
      const { error } = productSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });

      const produkti = await productService.krijoProdukt(req.body);
      res.status(201).json(produkti);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

getAll: async (req, res) => {
  try {
    const data = await Produkti.findAll({
      include: [
        { model: Kategoria },
        { model: NjesiaMatese},
        { model: Inventory} // opsionale
      ]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},

getById: async (req, res) => {
  try {
    const produkti = await Produkti.findByPk(req.params.id, {
      include: [
        { model: Kategoria },
        { model: NjesiaMatese },
        { model: Inventory }
      ]
    });
    if (!produkti) return res.status(404).json({ message: "Produkti nuk u gjet" });
    res.json(produkti);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},


update: async (req, res) => {
  try {
    const produkti = await productService.perditeso(req.params.id, req.body);
    res.json({ message: "Produkti u përditësua", produkti });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},


  delete: async (req, res) => {
    try {
      await productService.fshij(req.params.id);
      res.json({ message: "Produkti u fshi" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
