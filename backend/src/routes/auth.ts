import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_EXPIRY = "8h";

// POST /api/auth/login
// Mocked: any non-empty email + password returns a signed JWT
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // Mocked auth — accept any valid-format credentials
  const payload = {
    sub: email.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    name: email.split("@")[0],
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({
    token,
    user: { email: payload.email, name: payload.name },
  });
});

// POST /api/auth/logout — stateless JWT; client just drops the token
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
