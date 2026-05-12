import { Router } from "express";
import { db } from "@workspace/db";
import * as schemaModule from "@workspace/db/schema";
const { transactionsTable, cashBooksTable } = schemaModule;
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
    const tx = await db.select().from(transactionsTable).where(eq(transactionsTable.bookId, bookId));
    res.json(tx);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const { bookId, type, amount, category, note, date, payMode, proof } = req.body;
    if (!bookId || !type || !amount || !category) {
      return res.status(400).json({ error: "bookId, type, amount, category required" });
    }
    if (!(await verifyBookOwnership(bookId, req.session.userId))) {
      return res.status(404).json({ error: "Book not found" });
    }
    const [tx] = await db.insert(transactionsTable).values({
      bookId, type, amount: amount.toString(), category,
      note: note || "", date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      payMode: payMode || "cash", proof: proof || null,
    }).returning();
    res.json(tx);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id));
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (!(await verifyBookOwnership(tx.bookId, req.session.userId))) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
