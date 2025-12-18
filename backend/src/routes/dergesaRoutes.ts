import { Router } from "express";
import { DergeseController } from "../controllers/DergeseController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new DergeseController();

router.use(autentifiko);

router.get(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.listo
);
router.get(
  "/shofer/me",
  autorizoRolet(RoleName.SHOFER),
  controller.listoTeMiats
);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHOFER),
  controller.gjurmo
);
router.post(
  "/",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.krijo
);
router.put(
  "/:id/cakto",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.caktoShofer
);
router.put(
  "/:id/status",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER, RoleName.SHOFER),
  controller.perditesoStatus
);
router.put(
  "/:id/pozicion",
  autorizoRolet(RoleName.SHOFER),
  controller.perditesoPozicion
);
router.get(
  "/shoferet/disponueshem",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.shoferetEDisponueshem
);

export default router;




