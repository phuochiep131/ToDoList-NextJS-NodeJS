import jwt from "jsonwebtoken";
import {
  authenticateUser,
  createUser,
  getUserById,
} from "../services/userService.js";

const expiresIn = process.env.TOKEN_EXPIRES_IN || "7d";

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error("Thiếu cấu hình JWT_SECRET.");
    error.code = "MISSING_JWT_SECRET";
    throw error;
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export async function register(req, res) {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name : "";
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ error: "Email và mật khẩu là bắt buộc." });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ error: "Mật khẩu tối thiểu 6 ký tự." });
    }

    const user = await createUser({ name, email, password });
    const token = signToken(user.id);

    return res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({ error: error.message });
    }
    if (error.code === "MISSING_JWT_SECRET") {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Không thể đăng ký." });
  }
}

export async function login(req, res) {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ error: "Email và mật khẩu là bắt buộc." });
    }

    const user = await authenticateUser({ email, password });
    const token = signToken(user.id);

    return res.json({ user, token });
  } catch (error) {
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: error.message });
    }
    if (error.code === "MISSING_JWT_SECRET") {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Không thể đăng nhập." });
  }
}

export async function me(req, res) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Không thể tải thông tin." });
  }
}
