import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.userId, req.session.userId));
    res.json(invoices);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const { customerId, invoiceNo, status, subtotal, discountTotal, vatAmount, whtAmount, total, vatRate, whtRate, terms, billingAddress, notes, items, invoiceDate, dueDate, sellerTin, buyerTin, currency, signature } = req.body;
    if (!invoiceNo || !invoiceDate) return res.status(400).json({ error: "invoiceNo and invoiceDate required" });
    const count = await db.select().from(invoicesTable).where(eq(invoicesTable.userId, req.session.userId));
    const no = invoiceNo || `FEL-${String(count.length + 1).padStart(3, "0")}`;
    const [invoice] = await db.insert(invoicesTable).values({
      userId: req.session.userId, customerId: customerId || null,
      invoiceNo: no, status: status || "draft",
      subtotal: (subtotal || 0).toString(),
      discountTotal: (discountTotal || 0).toString(),
      vatAmount: (vatAmount || 0).toString(),
      whtAmount: (whtAmount || 0).toString(),
      total: (total || 0).toString(),
      vatRate: (vatRate || 0).toString(),
      whtRate: (whtRate || 0).toString(),
      terms: terms || "net30",
      billingAddress: billingAddress || "", notes: notes || "",
      items: items || [], invoiceDate,
      dueDate: dueDate || "",
      sellerTin: sellerTin || "",
      buyerTin: buyerTin || "",
      currency: currency || "EGP",
      signature: signature || "",
    }).returning();
    res.json(invoice);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const { status, subtotal, discountTotal, vatAmount, whtAmount, total, vatRate, whtRate, terms, billingAddress, notes, items, dueDate, sellerTin, buyerTin, currency, invoiceNo, invoiceDate, customerId, signature } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (subtotal !== undefined) updates.subtotal = subtotal.toString();
    if (discountTotal !== undefined) updates.discountTotal = discountTotal.toString();
    if (vatAmount !== undefined) updates.vatAmount = vatAmount.toString();
    if (whtAmount !== undefined) updates.whtAmount = whtAmount.toString();
    if (total !== undefined) updates.total = total.toString();
    if (vatRate !== undefined) updates.vatRate = vatRate.toString();
    if (whtRate !== undefined) updates.whtRate = whtRate.toString();
    if (terms !== undefined) updates.terms = terms;
    if (billingAddress !== undefined) updates.billingAddress = billingAddress;
    if (notes !== undefined) updates.notes = notes;
    if (items !== undefined) updates.items = items;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (sellerTin !== undefined) updates.sellerTin = sellerTin;
    if (buyerTin !== undefined) updates.buyerTin = buyerTin;
    if (currency !== undefined) updates.currency = currency;
    if (invoiceNo !== undefined) updates.invoiceNo = invoiceNo;
    if (invoiceDate !== undefined) updates.invoiceDate = invoiceDate;
    if (customerId !== undefined) updates.customerId = customerId;
    if (signature !== undefined) updates.signature = signature;
    const [invoice] = await db.update(invoicesTable).set(updates)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, req.session.userId)))
      .returning();
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    await db.delete(invoicesTable)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, req.session.userId)));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
