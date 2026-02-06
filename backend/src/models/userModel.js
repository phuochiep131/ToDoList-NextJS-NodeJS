export function toUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name || "",
    email: doc.email,
    createdAt: doc.createdAt,
  };
}
