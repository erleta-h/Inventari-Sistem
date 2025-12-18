import { Router } from "express";
import { RolController } from "../controllers/RolController";
import { autentifiko, autorizoRolet } from "../middlewares/authMiddleware";
import { RoleName } from "../models/Rol";

const router = Router();
const controller = new RolController();

router.use(autentifiko);

router.get("/", autorizoRolet(RoleName.ADMIN, RoleName.MENAXHER), controller.listo);

export default router;







