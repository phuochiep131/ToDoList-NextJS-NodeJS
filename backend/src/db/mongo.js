import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Thiếu biến môi trường MONGODB_URI.");
}

const dbName = process.env.MONGODB_DB || "todo_app";

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getTodosCollection() {
  const clientInstance = await clientPromise;
  return clientInstance.db(dbName).collection("todos");
}

export async function getUsersCollection() {
  const clientInstance = await clientPromise;
  return clientInstance.db(dbName).collection("users");
}
