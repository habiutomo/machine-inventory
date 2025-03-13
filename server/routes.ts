import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertMachineSchema,
  insertMachineTypeSchema,
  insertMachineBrandSchema,
  insertMachineTransferSchema
} from "@shared/schema";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireSuperAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated() || req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Machine routes
  app.get("/api/machines", requireAuth, async (req, res) => {
    const machines = await storage.listMachines();
    res.json(machines);
  });

  app.post("/api/machines", requireAuth, async (req, res) => {
    const result = insertMachineSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid machine data" });
    }
    const machine = await storage.createMachine(result.data);
    res.status(201).json(machine);
  });

  app.patch("/api/machines/:id", requireAuth, async (req, res) => {
    const machine = await storage.updateMachine(Number(req.params.id), req.body);
    res.json(machine);
  });

  app.delete("/api/machines/:id", requireSuperAdmin, async (req, res) => {
    await storage.deleteMachine(Number(req.params.id));
    res.sendStatus(204);
  });

  // Machine types routes
  app.get("/api/machine-types", requireAuth, async (req, res) => {
    const types = await storage.listMachineTypes();
    res.json(types);
  });

  app.post("/api/machine-types", requireAuth, async (req, res) => {
    const result = insertMachineTypeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid machine type data" });
    }
    const type = await storage.createMachineType(result.data);
    res.status(201).json(type);
  });

  // Machine brands routes
  app.get("/api/machine-brands", requireAuth, async (req, res) => {
    const brands = await storage.listMachineBrands();
    res.json(brands);
  });

  app.post("/api/machine-brands", requireAuth, async (req, res) => {
    const result = insertMachineBrandSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid machine brand data" });
    }
    const brand = await storage.createMachineBrand(result.data);
    res.status(201).json(brand);
  });

  // Transfer routes
  app.post("/api/transfers", requireAuth, async (req, res) => {
    const result = insertMachineTransferSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid transfer data" });
    }
    const transfer = await storage.createTransfer(result.data);
    res.status(201).json(transfer);
  });

  app.get("/api/machines/:id/transfers", requireAuth, async (req, res) => {
    const transfers = await storage.getMachineTransfers(Number(req.params.id));
    res.json(transfers);
  });

  const httpServer = createServer(app);
  return httpServer;
}
