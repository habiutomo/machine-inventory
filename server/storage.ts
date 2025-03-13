import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import {
  User, InsertUser,
  Machine, InsertMachine,
  MachineType, InsertMachineType,
  MachineBrand, InsertMachineBrand,
  MachineTransfer, InsertMachineTransfer
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private machines: Map<number, Machine>;
  private machineTypes: Map<number, MachineType>;
  private machineBrands: Map<number, MachineBrand>;
  private machineTransfers: Map<number, MachineTransfer>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.machineTypes = new Map();
    this.machineBrands = new Map();
    this.machineTransfers = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Machine operations
  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machines.get(id);
  }

  async getMachineByBarcode(barcode: string): Promise<Machine | undefined> {
    return Array.from(this.machines.values()).find(
      (machine) => machine.barcode === barcode,
    );
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const id = this.currentId++;
    const machine: Machine = { ...insertMachine, id };
    this.machines.set(id, machine);
    
    // Update type count
    const type = this.machineTypes.get(machine.typeId);
    if (type) {
      type.totalCount++;
      this.machineTypes.set(type.id, type);
    }
    
    return machine;
  }

  async updateMachine(id: number, updates: Partial<Machine>): Promise<Machine> {
    const machine = this.machines.get(id);
    if (!machine) throw new Error("Machine not found");
    
    const updatedMachine = { ...machine, ...updates };
    this.machines.set(id, updatedMachine);
    return updatedMachine;
  }

  async deleteMachine(id: number): Promise<void> {
    const machine = this.machines.get(id);
    if (!machine) throw new Error("Machine not found");
    
    // Update type count
    const type = this.machineTypes.get(machine.typeId);
    if (type) {
      type.totalCount--;
      this.machineTypes.set(type.id, type);
    }
    
    this.machines.delete(id);
  }

  async listMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }

  // Machine type operations
  async createMachineType(insertType: InsertMachineType): Promise<MachineType> {
    const id = this.currentId++;
    const type: MachineType = { ...insertType, id };
    this.machineTypes.set(id, type);
    return type;
  }

  async listMachineTypes(): Promise<MachineType[]> {
    return Array.from(this.machineTypes.values());
  }

  // Machine brand operations
  async createMachineBrand(insertBrand: InsertMachineBrand): Promise<MachineBrand> {
    const id = this.currentId++;
    const brand: MachineBrand = { ...insertBrand, id };
    this.machineBrands.set(id, brand);
    return brand;
  }

  async listMachineBrands(): Promise<MachineBrand[]> {
    return Array.from(this.machineBrands.values());
  }

  // Transfer operations
  async createTransfer(insertTransfer: InsertMachineTransfer): Promise<MachineTransfer> {
    const id = this.currentId++;
    const transfer: MachineTransfer = { ...insertTransfer, id };
    this.machineTransfers.set(id, transfer);
    
    // Update machine location
    const machine = this.machines.get(transfer.machineId);
    if (machine) {
      machine.location = transfer.toLocation;
      this.machines.set(machine.id, machine);
    }
    
    return transfer;
  }

  async getMachineTransfers(machineId: number): Promise<MachineTransfer[]> {
    return Array.from(this.machineTransfers.values())
      .filter(transfer => transfer.machineId === machineId)
      .sort((a, b) => b.transferDate.getTime() - a.transferDate.getTime());
  }
}

export const storage = new MemStorage();
