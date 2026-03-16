import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, region } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      email, password: hashed, name, region: region || "EG",
      avatar: name.charAt(0).toUpperCase(),
    }).returning();
    req.session.userId = user.id;
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    req.session.userId = user.id;
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.put("/profile", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { name, region } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (region) updates.region = region;
    updates.updatedAt = new Date();
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.session.userId)).returning();
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
