import { Router } from "express";
import { db } from "@workspace/db";
import { bookMembersTable, cashBooksTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

async function verifyBookOwnership(bookId: number, userId: number): Promise<boolean> {
  const [book] = await db.select().from(cashBooksTable)
    .where(and(eq(cashBooksTable.id, bookId), eq(cashBooksTable.userId, userId)));
  return !!book;
}

router.get("/:bookId", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const bookId = parseInt(req.params.bookId);
    if (!(await verifyBookOwnership(bookId, req.session.userId))) {
      return res.status(404).json({ error: "Book not found" });
    }
    const members = await db.select().from(bookMembersTable).where(eq(bookMembersTable.bookId, bookId));
    res.json(members);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const { bookId, name, email, role } = req.body;
    if (!bookId || !name || !email) return res.status(400).json({ error: "bookId, name, email required" });
    if (!(await verifyBookOwnership(bookId, req.session.userId))) {
      return res.status(404).json({ error: "Book not found" });
    }
    const avatar = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const [member] = await db.insert(bookMembersTable).values({
      bookId, name, email, role: role || "viewer", avatar,
    }).returning();
    res.json(member);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const [member] = await db.select().from(bookMembersTable).where(eq(bookMembersTable.id, id));
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (!(await verifyBookOwnership(member.bookId, req.session.userId))) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role required" });
    const [updated] = await db.update(bookMembersTable).set({ role }).where(eq(bookMembersTable.id, id)).returning();
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const [member] = await db.select().from(bookMembersTable).where(eq(bookMembersTable.id, id));
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (!(await verifyBookOwnership(member.bookId, req.session.userId))) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await db.delete(bookMembersTable).where(eq(bookMembersTable.id, id));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
