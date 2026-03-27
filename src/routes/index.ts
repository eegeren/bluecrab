import { Router } from "express";
import authRoutes from "./auth.routes";
import postRoutes from "./post.routes";
import sessionRoutes from "./session.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/sessions", sessionRoutes);

export default router;
