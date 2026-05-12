import { Router } from "express";
import { db } from "@workspace/db";
import * as schemaModule from "@workspace/db/schema";
const { cashBooksTable, transactionsTable, bookMembersTable } = schemaModule;
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const books = await db.select().from(cashBooksTable).where(eq(cashBooksTable.userId, req.session.userId));
    const result = await Promise.all(books.map(async (book) => {
      const tx = await db.select().from(transactionsTable).where(eq(transactionsTable.bookId, book.id));
      const members = await db.select().from(bookMembersTable).where(eq(bookMembersTable.bookId, book.id));
      return { ...book, tx, members };
    }));
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const { name, type, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const [book] = await db.insert(cashBooksTable).values({
      userId: req.session.userId, name, type: type || "business",
      icon: icon || "🏪", color: color || "#C8A630",
    }).returning();
    await db.insert(bookMembersTable).values({
      bookId: book.id, name: "Admin (You)", email: "admin@felosak.com",
      role: "admin", avatar: "A",
    });
    const members = await db.select().from(bookMembersTable).where(eq(bookMembersTable.bookId, book.id));
    res.json({ ...book, tx: [], members });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const { name, icon, color, type } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (icon) updates.icon = icon;
    if (color) updates.color = color;
    if (type) updates.type = type;
    const [book] = await db.update(cashBooksTable).set(updates)
      .where(and(eq(cashBooksTable.id, id), eq(cashBooksTable.userId, req.session.userId)))
      .returning();
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    await db.delete(cashBooksTable)
      .where(and(eq(cashBooksTable.id, id), eq(cashBooksTable.userId, req.session.userId)));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
