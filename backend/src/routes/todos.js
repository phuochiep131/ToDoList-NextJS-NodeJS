import { Router } from "express";
import {
  addTodo,
  getTodos,
  patchTodo,
  removeTodo,
} from "../controllers/todoController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getTodos);
router.post("/", addTodo);
router.patch("/:id", patchTodo);
router.delete("/:id", removeTodo);

export default router;
