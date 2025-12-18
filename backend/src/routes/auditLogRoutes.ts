import { Router } from "express";
import { AuditLogController } from "../controllers/AuditLogController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new AuditLogController();

router.use(autentifiko);

router.get("/", autorizoRolet(RoleName.ADMIN), controller.listo);

export default router;







