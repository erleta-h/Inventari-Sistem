const inventoryService = require("./inventari.service");
const { inventorySchema } = require("./inventari.validation");

module.exports = {
  create: async (req, res) => {
    try {
      const { error } = inventorySchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });

      const inventari = await inventoryService.krijo(req.body);
      res.status(201).json(inventari);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const data = await inventoryService.merrTeGjitha();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const inventari = await inventoryService.merrSipasId(req.params.id);
      if (!inventari) return res.status(404).json({ message: "Inventari nuk u gjet" });

      res.json(inventari);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      await inventoryService.perditeso(req.params.id, req.body);
      res.json({ message: "Inventari u përditësua" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await inventoryService.fshij(req.params.id);
      res.json({ message: "Inventari u fshi" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
