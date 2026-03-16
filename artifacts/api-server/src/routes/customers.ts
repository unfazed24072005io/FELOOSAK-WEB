import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const customers = await db.select().from(customersTable).where(eq(customersTable.userId, req.session.userId));
    res.json(customers);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const { name, phone, email, address, tin, owed, paid, trust } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const [customer] = await db.insert(customersTable).values({
      userId: req.session.userId, name, phone: phone || "",
      email: email || "", address: address || "", tin: tin || "",
      owed: (owed || 0).toString(), paid: (paid || 0).toString(), trust: trust || 50,
    }).returning();
    res.json(customer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const { name, phone, email, address, tin, owed, paid, trust } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (tin !== undefined) updates.tin = tin;
    if (owed !== undefined) updates.owed = owed.toString();
    if (paid !== undefined) updates.paid = paid.toString();
    if (trust !== undefined) updates.trust = trust;
    const [customer] = await db.update(customersTable).set(updates)
      .where(and(eq(customersTable.id, id), eq(customersTable.userId, req.session.userId)))
      .returning();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    await db.delete(customersTable)
      .where(and(eq(customersTable.id, id), eq(customersTable.userId, req.session.userId)));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
