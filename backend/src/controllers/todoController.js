import { createTodo, deleteTodo, listTodos, updateTodo } from "../services/todoService.js";

export async function getTodos(req, res) {
  try {
    const todos = await listTodos(req.user.id);
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ error: "Không thể tải công việc." });
  }
}

export async function addTodo(req, res) {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      return res.status(400).json({ error: "Vui lòng nhập tiêu đề." });
    }

    const created = await createTodo(req.user.id, title);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Không thể thêm công việc." });
  }
}

export async function patchTodo(req, res) {
  try {
    const { id } = req.params;
    const { title, completed } = req.body || {};

    const updated = await updateTodo(req.user.id, id, { title, completed });

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy công việc." });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Không thể cập nhật công việc." });
  }
}

export async function removeTodo(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteTodo(req.user.id, id);

    if (!ok) {
      return res.status(404).json({ error: "Không tìm thấy công việc." });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Không thể xóa công việc." });
  }
}
