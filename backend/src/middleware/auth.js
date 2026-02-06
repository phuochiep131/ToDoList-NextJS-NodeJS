import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Thiếu cấu hình JWT_SECRET." });
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Thiếu token xác thực." });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token không hợp lệ." });
  }
}
