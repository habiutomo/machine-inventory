import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with role
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "super_admin"] }).notNull(),
});

// Machine related models
export const machineTypes = pgTable("machine_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  totalCount: integer("total_count").notNull().default(0),
});

export const machineBrands = pgTable("machine_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  barcode: text("barcode").notNull().unique(),
  name: text("name").notNull(),
  status: text("status", { enum: ["new", "in_use", "broken", "sold"] }).notNull(),
  location: text("location").notNull(),
  typeId: integer("type_id").notNull(),
  brandId: integer("brand_id").notNull(),
});

export const machineTransfers = pgTable("machine_transfers", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  transferDate: timestamp("transfer_date").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertMachineTypeSchema = createInsertSchema(machineTypes);
export const insertMachineBrandSchema = createInsertSchema(machineBrands);
export const insertMachineSchema = createInsertSchema(machines);
export const insertMachineTransferSchema = createInsertSchema(machineTransfers);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MachineType = typeof machineTypes.$inferSelect;
export type InsertMachineType = z.infer<typeof insertMachineTypeSchema>;

export type MachineBrand = typeof machineBrands.$inferSelect;
export type InsertMachineBrand = z.infer<typeof insertMachineBrandSchema>;

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = z.infer<typeof insertMachineSchema>;

export type MachineTransfer = typeof machineTransfers.$inferSelect;
export type InsertMachineTransfer = z.infer<typeof insertMachineTransferSchema>;
