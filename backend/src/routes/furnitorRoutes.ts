import { Router } from "express";
import { FurnitorController } from "../controllers/FurnitorController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new FurnitorController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.listo
);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
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