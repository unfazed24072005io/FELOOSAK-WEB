import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, cashBooksTable, transactionsTable, bookMembersTable, customersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/seed", async (req, res) => {
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, "admin@feloosak.com")).limit(1);
    if (existing.length > 0) {
      return res.json({ message: "Already seeded", userId: existing[0].id });
    }

    const hashed = await bcrypt.hash("admin123", 10);
    const [user] = await db.insert(usersTable).values({
      email: "admin@feloosak.com", password: hashed, name: "Admin",
      region: "EG", avatar: "A",
    }).returning();

    const booksData = [
      { name: "Main Shop", type: "business" as const, icon: "🏪", color: "#C8A630" },
      { name: "Online Store", type: "business" as const, icon: "🛒", color: "#2680EB" },
      { name: "Freelance Projects", type: "business" as const, icon: "💼", color: "#22A06B" },
      { name: "Personal Wallet", type: "personal" as const, icon: "👛", color: "#E34935" },
      { name: "Savings", type: "personal" as const, icon: "🏦", color: "#8B5CF6" },
    ];

    const createdBooks = await Promise.all(booksData.map(async (b) => {
      const [book] = await db.insert(cashBooksTable).values({ userId: user.id, ...b }).returning();
      return book;
    }));

    await db.insert(bookMembersTable).values([
      { bookId: createdBooks[0].id, name: "Admin (You)", email: "admin@feloosak.com", role: "admin", avatar: "A" },
      { bookId: createdBooks[0].id, name: "Ahmed Hassan", email: "ahmed@shop.com", role: "editor", avatar: "AH" },
      { bookId: createdBooks[0].id, name: "Sara Viewer", email: "sara@shop.com", role: "viewer", avatar: "SV" },
      { bookId: createdBooks[1].id, name: "Admin (You)", email: "admin@feloosak.com", role: "admin", avatar: "A" },
      { bookId: createdBooks[2].id, name: "Admin (You)", email: "admin@feloosak.com", role: "admin", avatar: "A" },
      { bookId: createdBooks[3].id, name: "Admin (You)", email: "admin@feloosak.com", role: "admin", avatar: "A" },
      { bookId: createdBooks[4].id, name: "Admin (You)", email: "admin@feloosak.com", role: "admin", avatar: "A" },
    ]);

    const txData = [
      { bookId: createdBooks[0].id, type: "in", amount: "12500", category: "sales", note: "Shop daily sales", date: "Mar 16", payMode: "cash" },
      { bookId: createdBooks[0].id, type: "out", amount: "3200", category: "inventory", note: "Stock purchase", date: "Mar 16", payMode: "instapay" },
      { bookId: createdBooks[0].id, type: "in", amount: "8700", category: "sales", note: "Wholesale – Ahmed", date: "Mar 15", payMode: "bank_transfer" },
      { bookId: createdBooks[0].id, type: "out", amount: "5000", category: "rent", note: "March shop rent", date: "Mar 15", payMode: "cib" },
      { bookId: createdBooks[0].id, type: "in", amount: "4500", category: "services", note: "Delivery fees", date: "Mar 14", payMode: "fawry" },
      { bookId: createdBooks[0].id, type: "out", amount: "1800", category: "utilities", note: "Electricity bill", date: "Mar 14", payMode: "fawry" },
      { bookId: createdBooks[0].id, type: "in", amount: "15000", category: "sales", note: "Bulk sale – Mohamed", date: "Mar 13", payMode: "nbe" },
      { bookId: createdBooks[0].id, type: "out", amount: "7500", category: "salaries", note: "Employee salaries", date: "Mar 13", payMode: "banque_misr" },
      { bookId: createdBooks[1].id, type: "in", amount: "6200", category: "sales", note: "Online orders", date: "Mar 12", payMode: "paymob" },
      { bookId: createdBooks[1].id, type: "out", amount: "950", category: "transport", note: "Shipping costs", date: "Mar 12", payMode: "vodafone_cash" },
      { bookId: createdBooks[1].id, type: "in", amount: "3800", category: "services", note: "Consultation", date: "Mar 11", payMode: "instapay" },
      { bookId: createdBooks[1].id, type: "out", amount: "2400", category: "maintenance", note: "Website hosting", date: "Mar 11", payMode: "cib" },
      { bookId: createdBooks[2].id, type: "in", amount: "9900", category: "services", note: "Design project – Sara", date: "Mar 10", payMode: "instapay" },
      { bookId: createdBooks[2].id, type: "out", amount: "1200", category: "utilities", note: "Software licenses", date: "Mar 9", payMode: "meeza" },
      { bookId: createdBooks[3].id, type: "in", amount: "18000", category: "salary", note: "Monthly salary", date: "Mar 1", payMode: "nbe" },
      { bookId: createdBooks[3].id, type: "out", amount: "4500", category: "groceries", note: "Weekly groceries", date: "Mar 15", payMode: "cash" },
      { bookId: createdBooks[3].id, type: "out", amount: "2000", category: "dining", note: "Restaurants", date: "Mar 14", payMode: "vodafone_cash" },
      { bookId: createdBooks[3].id, type: "out", amount: "800", category: "entertainment", note: "Netflix & Spotify", date: "Mar 10", payMode: "cib" },
      { bookId: createdBooks[3].id, type: "out", amount: "3500", category: "bills", note: "Phone & Internet", date: "Mar 5", payMode: "fawry" },
      { bookId: createdBooks[4].id, type: "in", amount: "5000", category: "savings", note: "Monthly savings transfer", date: "Mar 1", payMode: "cib" },
      { bookId: createdBooks[4].id, type: "in", amount: "2500", category: "freelance", note: "Side gig payment", date: "Mar 8", payMode: "instapay" },
    ];

    await db.insert(transactionsTable).values(txData);

    const custData = [
      { userId: user.id, name: "Ahmed Hassan", phone: "+201012345678", owed: "8700", paid: "25000", trust: 92 },
      { userId: user.id, name: "Mohamed Ali", phone: "+201098765432", owed: "15000", paid: "45000", trust: 85 },
      { userId: user.id, name: "Sara Ibrahim", phone: "+201155544433", owed: "3800", paid: "12000", trust: 95 },
      { userId: user.id, name: "Khaled Mahmoud", phone: "+201234567890", owed: "22000", paid: "18000", trust: 65 },
      { userId: user.id, name: "Fatma Youssef", phone: "+201188877766", owed: "0", paid: "35000", trust: 99 },
    ];

    await db.insert(customersTable).values(custData);

    res.json({ message: "Seeded successfully", userId: user.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
