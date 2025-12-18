import { Router } from "express";
import { PerdoruesController } from "../controllers/PerdoruesController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new PerdoruesController();

// ADMIN / MENAXHER
router.use(autentifiko);

router.get("/", autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER), controller.listo);
router.get(
  "/:id",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.merr
);
router.post(
  "/",
  autorizoRolet(RoleName.ADMIN),
  controller.krijo
);
router.put(
  "/:id",
  autorizoRolet(RoleName.ADMIN),
  controller.perditeso
);
router.delete(
  "/:id",
  autorizoRolet(RoleName.ADMIN),
  controller.fshi
);

export default router;

