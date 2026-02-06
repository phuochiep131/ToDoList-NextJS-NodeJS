export function toTodo(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    completed: Boolean(doc.completed),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt || null,
  };
}
