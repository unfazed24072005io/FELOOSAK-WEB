import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import booksRouter from "./books";
import transactionsRouter from "./transactions";
import membersRouter from "./members";
import customersRouter from "./customers";
import invoicesRouter from "./invoices";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(seedRouter);
router.use("/auth", authRouter);
router.use("/books", booksRouter);
router.use("/transactions", transactionsRouter);
router.use("/members", membersRouter);
router.use("/customers", customersRouter);
router.use("/invoices", invoicesRouter);

export default router;
