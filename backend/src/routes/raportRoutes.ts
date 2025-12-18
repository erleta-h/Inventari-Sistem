import { Router } from "express";
import { RaportController } from "../controllers/RaportController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new RaportController();

router.use(autentifiko);

router.get(
  "/inventar",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.inventar
);
router.get(
  "/performance",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.performance
);
router.get(
  "/furnitore",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.furnitore
);
router.get(
  "/financiar",
  autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER),
  controller.financiar
);

export default router;




