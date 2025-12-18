import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const orderController = new OrderController();

router.use(authMiddleware);

router.post(
  "/",
  requireRole(RoleName.SHITES, RoleName.MENAXHER),
  orderController.krijimPorosi
);

router.get(
  "/",
  requireRole(RoleName.SHITES, RoleName.MENAXHER),
  orderController.listoPorosite
);

router.get(
  "/:id",
  requireRole(RoleName.SHITES, RoleName.MENAXHER),
  orderController.gjejPorosi
);

router.put(
  "/:id",
  requireRole(RoleName.SHITES, RoleName.MENAXHER),
  orderController.perditesimPorosi
);

router.post(
  "/:id/anulo",
  requireRole(RoleName.SHITES, RoleName.MENAXHER),
  orderController.anuloPorosi
);

export default router;