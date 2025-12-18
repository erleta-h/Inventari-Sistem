import { Router } from "express";
import { DepoController } from "../controllers/DepoController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new DepoController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES),
  controller.listo
);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES),
  controller.merr
);
router.post(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.krijo
);
router.put(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.perditeso
);
router.delete(
  "/:id",
  autorizoRolet(RoleName.ADMIN),
  controller.fshi
);

export default router;