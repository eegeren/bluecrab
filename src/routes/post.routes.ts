import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, postController.createPost);
router.get("/", postController.listPosts);
router.delete("/:id", authenticate, postController.deletePost);

export default router;
