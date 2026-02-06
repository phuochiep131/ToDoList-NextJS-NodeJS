import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getUsersCollection } from "../db/mongo.js";
import { toUser } from "../models/userModel.js";

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function createUser({ name, email, password }) {
  const emailNormalized = email.trim().toLowerCase();
  const collection = await getUsersCollection();

  const existing = await collection.findOne({ email: emailNormalized });
  if (existing) {
    throw createError("EMAIL_EXISTS", "Email đã được sử dụng.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const doc = {
    name: name?.trim() || "",
    email: emailNormalized,
    passwordHash,
    createdAt: now,
  };

  const result = await collection.insertOne(doc);
  return toUser({ ...doc, _id: result.insertedId });
}

export async function authenticateUser({ email, password }) {
  const emailNormalized = email.trim().toLowerCase();
  const collection = await getUsersCollection();
  const userDoc = await collection.findOne({ email: emailNormalized });

  if (!userDoc) {
    throw createError("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng.");
  }

  const ok = await bcrypt.compare(password, userDoc.passwordHash);
  if (!ok) {
    throw createError("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng.");
  }

  return toUser(userDoc);
}

export async function getUserById(id) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getUsersCollection();
  const userDoc = await collection.findOne({ _id: new ObjectId(id) });
  return toUser(userDoc);
}
