import { Router } from "express";
import * as sessionController from "../controllers/session.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, sessionController.listSessions);
router.delete("/:id", authenticate, sessionController.revokeSession);

export default router;
