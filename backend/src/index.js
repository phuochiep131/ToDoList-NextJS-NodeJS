import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import todosRouter from "./routes/todos.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

const rawOrigins = process.env.CORS_ORIGIN;
const origins = rawOrigins
  ? rawOrigins.split(",").map((value) => value.trim()).filter(Boolean)
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: origins,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/todos", todosRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
