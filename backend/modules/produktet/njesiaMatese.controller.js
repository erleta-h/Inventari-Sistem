// modules/produkte/njesiaMatese.controller.js
const njesiaService = require("./njesiaMatese.service");
const { njesiaSchema } = require("./njesiaMatese.validation");

module.exports = {
  create: async (req, res) => {
    try {
      const { error } = njesiaSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });

      const n = await njesiaService.create(req.body);
      res.status(201).json(n);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const data = await njesiaService.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const n = await njesiaService.getById(req.params.id);
      if (!n) return res.status(404).json({ message: "Njësia nuk u gjet" });
      res.json(n);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const n = await njesiaService.update(req.params.id, req.body);
      res.json({ message: "Njësia u përditësua", n });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await njesiaService.delete(req.params.id);
      res.json({ message: "Njësia u fshi" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
