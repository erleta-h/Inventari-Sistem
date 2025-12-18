import { Router } from "express";
import { InventarController } from "../controllers/InventarController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new InventarController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES),
  controller.listo
);

router.get(
  "/stok-minimal",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.stokMinimal
);

router.post(
  "/pranim",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.pranoMallin
);

router.put(
  "/stok",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.perditesoStok
);

router.post(
  "/transfer",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.transfero
);

router.get(
  "/transferet",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.listoTransferet
);

router.get(
  "/depo-me-stok",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES),
  controller.gjejDepoMeStok
);

export default router;