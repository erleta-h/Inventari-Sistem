import { Router } from "express";
import { NjoftimController } from "../controllers/NjoftimController";
import { autentifiko } from "../middlewares/authMiddleware";

const router = Router();
const controller = new NjoftimController();

router.use(autentifiko);

router.get("/", controller.listoPerdoruesit);
router.get("/te-paleksuar", controller.tePaleksuar);
router.put("/:id/lexuar", controller.shenoSiLexuar);

export default router;







