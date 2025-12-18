import { Router } from "express";
import { PorosiController } from "../controllers/PorosiController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new PorosiController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES, RoleName.MAGAZINIER),
  controller.listo
);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES, RoleName.MAGAZINIER),
  controller.merr
);
router.post(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.krijo
);
router.put(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.perditeso
);
router.post(
  "/:id/anulo",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.anulo
);
router.put(
  "/:id/pagese",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.perditesoPagese
);
router.put(
  "/:id/fillo-pergatitje",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.filloPergatitje
);
router.put(
  "/:id/bej-gati",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.bejGati
);

export default router;