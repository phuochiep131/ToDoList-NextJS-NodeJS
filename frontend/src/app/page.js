"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api/todos";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState([]);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((todo) => todo.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  }, [todos]);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_BASE, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Không thể tải công việc.");
      }
      const data = await response.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSaving(true);
    setError("");
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể thêm công việc.");
      }

      const created = await response.json();
      setTodos((prev) => [created, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo) {
    if (busyIds.includes(todo.id)) return;
    setBusyIds((prev) => [...prev, todo.id]);
    setError("");

    const nextTodo = { ...todo, completed: !todo.completed };
    setTodos((prev) =>
      prev.map((item) => (item.id === todo.id ? nextTodo : item))
    );

    try {
      const response = await fetch(`${API_BASE}/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextTodo.completed }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật công việc.");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
      setTodos((prev) =>
        prev.map((item) => (item.id === todo.id ? todo : item))
      );
    } finally {
      setBusyIds((prev) => prev.filter((id) => id !== todo.id));
    }
  }

  async function deleteTodo(todo) {
    if (busyIds.includes(todo.id)) return;
    setBusyIds((prev) => [...prev, todo.id]);
    setError("");

    const previous = todos;
    setTodos((prev) => prev.filter((item) => item.id !== todo.id));

    try {
      const response = await fetch(`${API_BASE}/${todo.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa công việc.");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
      setTodos(previous);
    } finally {
      setBusyIds((prev) => prev.filter((id) => id !== todo.id));
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <main className={styles.card}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Tập trung hôm nay</p>
            <h1 className={styles.title}>Danh sách công việc</h1>
            <p className={styles.subtitle}>
              Giữ công việc ngắn gọn, rõ ràng và khả thi.
            </p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Tổng</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Hoàn thành</span>
              <span className={styles.statValue}>{stats.done}</span>
            </div>
            <div className={styles.progress}>
              <div
                className={styles.progressBar}
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </header>

        <form className={styles.form} onSubmit={addTodo}>
          <input
            className={styles.input}
            type="text"
            placeholder="Thêm công việc mới"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={saving}
          />
          <button className={styles.addButton} type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Thêm công việc"}
          </button>
        </form>

        {error ? <div className={styles.error}>{error}</div> : null}

        <section className={styles.list}>
          {loading ? (
            <div className={styles.loading}>Đang tải công việc...</div>
          ) : null}
          {!loading && todos.length === 0 ? (
            <div className={styles.empty}>
              Chưa có công việc nào. Hãy thêm công việc đầu tiên.
            </div>
          ) : null}
          {todos.map((todo, index) => {
            const isBusy = busyIds.includes(todo.id);
            return (
              <div
                key={todo.id}
                className={`${styles.item} ${
                  todo.completed ? styles.done : ""
                }`}
                style={{ "--index": index }}
              >
                <button
                  className={styles.check}
                  type="button"
                  onClick={() => toggleTodo(todo)}
                  aria-label="Đánh dấu hoàn thành"
                  disabled={isBusy}
                />
                <div className={styles.text}>
                  <span className={styles.task}>{todo.title}</span>
                  <span className={styles.meta}>
                    {formatTimestamp(todo.createdAt)}
                  </span>
                </div>
                <button
                  className={styles.delete}
                  type="button"
                  onClick={() => deleteTodo(todo)}
                  disabled={isBusy}
                >
                  Xóa
                </button>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN");
}
