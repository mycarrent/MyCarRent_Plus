/**
 * IndexedDB Database Layer for My Car Rent
 * Uses the `idb` library for a promise-based API over IndexedDB.
 * Stores: entries, plates, vehicles
 * Version 3: Added vehicles store for maintenance dashboard
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ── Types ──────────────────────────────────────────────────────────
export type Category = "wash" | "delivery" | "pickup" | "other";

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  category: Category;
  plate: string;
  price: number;
  note: string;
  customTitle: string;
  createdAt: number;
  updatedAt: number;
}

export interface Plate {
  id: string;
  plate: string;
  model: string;
  color: string;
  createdAt: number;
}

export type VehicleStatus = "normal" | "approaching" | "overdue";

/** MaintenanceRecord — one check event per plate. Multiple records per plate allowed. */
export interface MaintenanceRecord {
  id: string;
  licensePlate: string;
  date: string; // YYYY-MM-DD
  maintenanceStage: number; // 1-20
  notes?: string;
  createdAt: number;
}

// ── DB Schema ──────────────────────────────────────────────────────
interface MyCarRentDB extends DBSchema {
  entries: {
    key: string;
    value: Entry;
    indexes: {
      "by-date": string;
      "by-category": Category;
      "by-plate": string;
      "by-date-category": [string, Category];
    };
  };
  plates: {
    key: string;
    value: Plate;
    indexes: {
      "by-plate": string;
    };
  };
  maintenance_records: {
    key: string;
    value: MaintenanceRecord;
    indexes: {
      "by-plate": string;
      "by-date": string;
    };
  };
}

// ── Singleton DB ───────────────────────────────────────────────────
let dbPromise: Promise<IDBPDatabase<MyCarRentDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MyCarRentDB>("my-car-rent-db", 4, {
      upgrade(db, oldVersion) {
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains("entries")) db.deleteObjectStore("entries");
          if (db.objectStoreNames.contains("plates")) db.deleteObjectStore("plates");
        }
        if (!db.objectStoreNames.contains("entries")) {
          const entryStore = db.createObjectStore("entries", { keyPath: "id" });
          entryStore.createIndex("by-date", "date");
          entryStore.createIndex("by-category", "category");
          entryStore.createIndex("by-plate", "plate");
          entryStore.createIndex("by-date-category", ["date", "category"]);
        }
        if (!db.objectStoreNames.contains("plates")) {
          const plateStore = db.createObjectStore("plates", { keyPath: "id" });
          plateStore.createIndex("by-plate", "plate", { unique: true });
        }
        // v3 vehicles store → v4 maintenance_records store
        if (oldVersion < 4) {
          if ((db.objectStoreNames as any).contains("vehicles")) db.deleteObjectStore("vehicles" as any);
          if (!db.objectStoreNames.contains("maintenance_records")) {
            const mrStore = db.createObjectStore("maintenance_records", { keyPath: "id" });
            mrStore.createIndex("by-plate", "licensePlate");
            mrStore.createIndex("by-date", "date");
          }
        }
      },
    });
  }
  return dbPromise;
}

// ── ID Generator ───────────────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Entry CRUD ─────────────────────────────────────────────────────
export async function addEntry(
  data: Omit<Entry, "id" | "createdAt" | "updatedAt">
): Promise<Entry> {
  const db = await getDB();
  const now = Date.now();
  const entry: Entry = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put("entries", entry);
  return entry;
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<Entry, "id" | "createdAt">>
): Promise<Entry | undefined> {
  const db = await getDB();
  const existing = await db.get("entries", id);
  if (!existing) return undefined;
  const updated: Entry = { ...existing, ...data, updatedAt: Date.now() };
  await db.put("entries", updated);
  return updated;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("entries", id);
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  const db = await getDB();
  return db.get("entries", id);
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await getDB();
  return db.getAll("entries");
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  const db = await getDB();
  return db.getAllFromIndex("entries", "by-date", date);
}

export async function getEntriesByCategory(category: Category): Promise<Entry[]> {
  const db = await getDB();
  return db.getAllFromIndex("entries", "by-category", category);
}

export async function getEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<Entry[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex("entries", "by-date", range);
}

// ── Plate CRUD ─────────────────────────────────────────────────────
export async function addPlate(
  plateNumber: string,
  model: string = "",
  color: string = ""
): Promise<Plate> {
  const db = await getDB();
  const plate: Plate = {
    id: generateId(),
    plate: plateNumber.trim(),
    model: model.trim(),
    color: color.trim(),
    createdAt: Date.now(),
  };
  await db.put("plates", plate);
  return plate;
}

export async function updatePlate(
  id: string,
  plateNumber: string,
  model?: string,
  color?: string
): Promise<Plate | undefined> {
  const db = await getDB();
  const existing = await db.get("plates", id);
  if (!existing) return undefined;
  const updated: Plate = {
    ...existing,
    plate: plateNumber.trim(),
    ...(model !== undefined ? { model: model.trim() } : {}),
    ...(color !== undefined ? { color: color.trim() } : {}),
  };
  await db.put("plates", updated);
  return updated;
}

export async function deletePlate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("plates", id);
}

export async function getAllPlates(): Promise<Plate[]> {
  const db = await getDB();
  return db.getAll("plates");
}

// ── Maintenance Record CRUD ────────────────────────────────────────
export function calculateStatus(date: string): VehicleStatus {
  const daysSince = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (daysSince > 37) return "overdue";
  if (daysSince > 23) return "approaching";
  return "normal";
}

/** Latest maintenance record per plate — used by dashboard */
export async function getLatestPerPlate(): Promise<{ record: MaintenanceRecord; status: VehicleStatus }[]> {
  const db = await getDB();
  const all = await db.getAll("maintenance_records");
  const map = new Map<string, MaintenanceRecord>();
  for (const r of all) {
    const existing = map.get(r.licensePlate);
    if (!existing || new Date(r.date) > new Date(existing.date) || (r.date === existing.date && r.createdAt > existing.createdAt)) {
      map.set(r.licensePlate, r);
    }
  }
  return Array.from(map.values())
    .map((r) => ({ record: r, status: calculateStatus(r.date) }))
    .sort((a, b) => new Date(b.record.date).getTime() - new Date(a.record.date).getTime());
}

/** All records for a specific plate, newest first */
export async function getRecordsByPlate(licensePlate: string): Promise<MaintenanceRecord[]> {
  const db = await getDB();
  const records = await db.getAllFromIndex("maintenance_records", "by-plate", licensePlate);
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  const db = await getDB();
  return db.getAll("maintenance_records");
}

export async function addMaintenanceRecord(data: Omit<MaintenanceRecord, "id" | "createdAt">): Promise<MaintenanceRecord> {
  const db = await getDB();
  const record: MaintenanceRecord = { ...data, id: generateId(), createdAt: Date.now() };
  await db.put("maintenance_records", record);
  return record;
}

export async function updateMaintenanceRecord(id: string, data: Partial<Omit<MaintenanceRecord, "id" | "createdAt">>): Promise<MaintenanceRecord | undefined> {
  const db = await getDB();
  const existing = await db.get("maintenance_records", id);
  if (!existing) return undefined;
  const updated = { ...existing, ...data };
  await db.put("maintenance_records", updated);
  return updated;
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("maintenance_records", id);
}

/** Migrate old localStorage vehicles → maintenance_records */
export async function migrateVehiclesFromLocalStorage(): Promise<number> {
  const stored = localStorage.getItem("vehicle-maintenance-dashboard");
  if (!stored) return 0;
  let data: any;
  try { data = JSON.parse(stored); } catch { return 0; }
  if (!data?.vehicles?.length) return 0;

  const db = await getDB();
  let migrated = 0;
  for (const v of data.vehicles) {
    const existing = await db.countFromIndex("maintenance_records", "by-plate", v.licensePlate);
    if (existing > 0) continue;
    await addMaintenanceRecord({ licensePlate: v.licensePlate, date: v.lastMaintenanceDate?.split("T")[0] || new Date().toISOString().split("T")[0], maintenanceStage: v.maintenanceStage || 1, notes: v.notes || "" });
    migrated++;
  }
  localStorage.removeItem("vehicle-maintenance-dashboard");
  return migrated;
}

// ── Seed Real Plates ───────────────────────────────────────────────
export async function seedRealPlates(): Promise<void> {
  const db = await getDB();
  const existingPlates = await db.count("plates");
  if (existingPlates > 0) return;

  const realPlates: { plate: string; model: string; color: string }[] = [
    { plate: "ขฉ 9452", model: "Yaris Ativ", color: "ขาว" },
    { plate: "ขฉ 7685", model: "Yaris Ativ", color: "เทา" },
    { plate: "ขฉ 7516", model: "Yaris Ativ", color: "ขาว" },
    { plate: "ขท 4090", model: "Yaris Ativ", color: "ขาว" },
    { plate: "ขต 3245", model: "City Turbo", color: "ขาว" },
    { plate: "ขต 9425", model: "City Turbo", color: "ขาว" },
    { plate: "ขต 9542", model: "City Turbo", color: "ขาว" },
    { plate: "ขท 529", model: "City Turbo", color: "ขาว" },
    { plate: "ขท 595", model: "City Turbo", color: "ขาว" },
    { plate: "ขธ 953", model: "City Turbo", color: "ขาว" },
    { plate: "ขต 9452", model: "City eHEV", color: "ขาว" },
    { plate: "ก 2064", model: "City eHEV", color: "ขาว" },
    { plate: "ขง 3753", model: "City Hatchback", color: "" },
    { plate: "ขจ 9894", model: "HRV", color: "ดำ" },
    { plate: "ขธ 54", model: "HRV", color: "ขาว" },
    { plate: "ขธ 945", model: "HRV", color: "ขาว" },
    { plate: "ขธ 996", model: "HRV", color: "ขาว" },
  ];

  for (const p of realPlates) {
    await addPlate(p.plate, p.model, p.color);
  }
}

// ── Seed Sample Data ───────────────────────────────────────────────
export async function seedSampleData(): Promise<void> {
  const db = await getDB();
  const existingEntries = await db.count("entries");
  if (existingEntries > 0) return;

  await seedRealPlates();
  const allPlates = await getAllPlates();
  const plateNumbers = allPlates.map((p) => p.plate);

  const categories: Category[] = ["wash", "delivery", "pickup"];
  const prices: Record<string, number[]> = {
    wash: [50, 100, 120, 150, 200],
    delivery: [25, 50, 75, 100, 120],
    pickup: [25, 50, 75, 100, 120],
  };
  const notes: Record<string, string[]> = {
    wash: ["ล้างภายนอก", "ล้างทั้งภายในภายนอก", "ล้างแว็กซ์", ""],
    delivery: ["ส่งสนามบิน", "ส่งโรงแรม", "ส่งบ้านลูกค้า", ""],
    pickup: ["เก็บจากสนามบิน", "เก็บจากโรงแรม", "เก็บจากอู่", ""],
  };

  const today = new Date();
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];

    const numEntries = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numEntries; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const plate = plateNumbers[Math.floor(Math.random() * plateNumbers.length)];
      const price = prices[cat][Math.floor(Math.random() * prices[cat].length)];
      const note = notes[cat][Math.floor(Math.random() * notes[cat].length)];

      await addEntry({ date: dateStr, category: cat, plate, price, note, customTitle: "" });
    }

    if (Math.random() < 0.3) {
      const otherTitles = ["ค่าน้ำมัน", "ค่าทางด่วน", "ค่าที่จอดรถ", "ค่าซ่อมบำรุง", "ค่าประกัน"];
      const otherPrices = [100, 150, 200, 300, 500, 1000];
      await addEntry({
        date: dateStr,
        category: "other",
        plate: "",
        price: otherPrices[Math.floor(Math.random() * otherPrices.length)],
        note: "",
        customTitle: otherTitles[Math.floor(Math.random() * otherTitles.length)],
      });
    }
  }
}
