import {
  pgTable,
  text,
  numeric,
  timestamp,
  integer,
  boolean,
  serial,
  date,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  icon: text("icon").default("📁"),
  budgetType: text("budget_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  date: date("date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  debtType: text("debt_type").notNull().default("other"),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull(),
  currentBalance: numeric("current_balance", { precision: 12, scale: 2 }),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  minimumPayment: numeric("minimum_payment", { precision: 12, scale: 2 }).notNull(),
  dueDay: integer("due_day"),
  totalTerm: integer("total_term"),
  remainingTerm: integer("remaining_term"),
  creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }),
  cardColor: text("card_color").default("from-slate-700 to-slate-900"),
  cardLastDigits: text("card_last_digits"),
  bankName: text("bank_name"),
  isPaidOff: boolean("is_paid_off").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debtPayments = pgTable("debt_payments", {
  id: serial("id").primaryKey(),
  debtId: integer("debt_id").references(() => debts.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  deadline: date("deadline"),
  icon: text("icon").default("🎯"),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").default("₽"),
  extraDebtPayment: numeric("extra_debt_payment", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
