import { ObjectId } from "mongodb";
import { getTodosCollection } from "../db/mongo.js";
import { toTodo } from "../models/todoModel.js";

export async function listTodos(userId) {
  const collection = await getTodosCollection();
  const docs = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toTodo);
}

export async function createTodo(userId, title) {
  const collection = await getTodosCollection();
  const now = new Date().toISOString();
  const doc = { userId, title, completed: false, createdAt: now, updatedAt: null };
  const result = await collection.insertOne(doc);
  return toTodo({ ...doc, _id: result.insertedId });
}

export async function updateTodo(userId, id, updates) {
  if (!ObjectId.isValid(id)) return null;

  const payload = {};
  if (typeof updates.title === "string" && updates.title.trim()) {
    payload.title = updates.title.trim();
  }
  if (typeof updates.completed === "boolean") {
    payload.completed = updates.completed;
  }
  if (Object.keys(payload).length === 0) return null;

  payload.updatedAt = new Date().toISOString();

  const collection = await getTodosCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: payload },
    { returnDocument: "after" }
  );

  if (!result.value) return null;
  return toTodo(result.value);
}

export async function deleteTodo(userId, id) {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getTodosCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id), userId });
  return result.deletedCount > 0;
}
