const depoService = require("./depo.service");
const { depoSchema } = require("./depo.validation");

module.exports = {
  
  create: async (req, res) => {
    try {
      const { error } = depoSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });

      const depo = await depoService.krijo(req.body);
      res.status(201).json(depo);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const depot = await depoService.merrTeGjitha();
      res.json(depot);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const depo = await depoService.merrSipasId(req.params.id);
      if (!depo) return res.status(404).json({ message: "Depo nuk u gjet" });

      res.json(depo);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      await depoService.perditeso(req.params.id, req.body);
      res.json({ message: "Depo u përditësua me sukses" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await depoService.fshij(req.params.id);
      res.json({ message: "Depo u fshi me sukses" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

};
