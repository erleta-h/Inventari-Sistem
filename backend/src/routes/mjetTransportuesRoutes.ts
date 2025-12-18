import { Router } from "express";
import { MjetTransportuesController } from "../controllers/MjetTransportuesController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new MjetTransportuesController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHOFER),
  controller.listo
);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
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