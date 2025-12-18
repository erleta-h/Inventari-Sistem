import { Router } from "express";
import { KlientController } from "../controllers/KlientController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new KlientController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.listo
);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.merr
);
router.post(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.krijo
);
router.put(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHITES),
  controller.perditeso
);
router.delete(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.fshi
);

export default router;







