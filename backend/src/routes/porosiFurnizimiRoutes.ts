import { Router } from "express";
import { PorosiFurnizimiController } from "../controllers/PorosiFurnizimiController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new PorosiFurnizimiController();

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
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.krijo
);
router.post(
  "/:id/pranim",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER),
  controller.pranoMallin
);

export default router;