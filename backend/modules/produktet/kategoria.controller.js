// modules/produkte/kategoria.controller.js
const kategoriaService = require("./kategoria.service");
const { kategoriaSchema } = require("./kategoria.validation");

module.exports = {
  create: async (req, res) => {
    try {
      const { error } = kategoriaSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });

      const k = await kategoriaService.create(req.body);
      res.status(201).json(k);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const data = await kategoriaService.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const k = await kategoriaService.getById(req.params.id);
      if (!k) return res.status(404).json({ message: "Kategoria nuk u gjet" });
      res.json(k);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const k = await kategoriaService.update(req.params.id, req.body);
      res.json({ message: "Kategoria u përditësua", k });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await kategoriaService.delete(req.params.id);
      res.json({ message: "Kategoria u fshi" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
