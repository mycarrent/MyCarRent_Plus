/**
 * DataContext — Global data provider for entries, plates, and vehicles
 * Wraps IndexedDB operations and provides reactive state to all sub-apps.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type Entry,
  type Plate,
  type MaintenanceRecord,
  type VehicleStatus,
  getAllEntries,
  getAllPlates,
  getLatestPerPlate,
  getAllMaintenanceRecords,
  addEntry as dbAddEntry,
  updateEntry as dbUpdateEntry,
  deleteEntry as dbDeleteEntry,
  addPlate as dbAddPlate,
  updatePlate as dbUpdatePlate,
  deletePlate as dbDeletePlate,
  addMaintenanceRecord as dbAddMaintenanceRecord,
  updateMaintenanceRecord as dbUpdateMaintenanceRecord,
  deleteMaintenanceRecord as dbDeleteMaintenanceRecord,
  seedSampleData,
  seedRealPlates,
  migrateVehiclesFromLocalStorage,
} from "@/lib/db";

export interface LatestPerPlate {
  record: MaintenanceRecord;
  status: VehicleStatus;
}

interface DataContextValue {
  entries: Entry[];
  plates: Plate[];
  latestRecords: LatestPerPlate[];
  allRecords: MaintenanceRecord[];
  loading: boolean;
  addEntry: (data: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<Omit<Entry, "id" | "createdAt">>) => Promise<Entry | undefined>;
  deleteEntry: (id: string) => Promise<void>;
  addPlate: (plate: string, model?: string, color?: string) => Promise<Plate>;
  updatePlate: (id: string, plate: string, model?: string, color?: string) => Promise<Plate | undefined>;
  deletePlate: (id: string) => Promise<void>;
  addMaintenanceRecord: (data: Omit<MaintenanceRecord, "id" | "createdAt">) => Promise<MaintenanceRecord>;
  updateMaintenanceRecord: (id: string, data: Partial<Omit<MaintenanceRecord, "id" | "createdAt">>) => Promise<MaintenanceRecord | undefined>;
  deleteMaintenanceRecord: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  seedData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [latestRecords, setLatestRecords] = useState<LatestPerPlate[]>([]);
  const [allRecords, setAllRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [e, p, lr, ar] = await Promise.all([
      getAllEntries(),
      getAllPlates(),
      getLatestPerPlate(),
      getAllMaintenanceRecords(),
    ]);
    e.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
    p.sort((a, b) => a.plate.localeCompare(b.plate));
    setEntries(e);
    setPlates(p);
    setLatestRecords(lr);
    setAllRecords(ar);
  }, []);

  useEffect(() => {
    seedRealPlates()
      .then(() => migrateVehiclesFromLocalStorage())
      .then(() => refresh())
      .finally(() => setLoading(false));
  }, [refresh]);

  // ── Entry mutations ──
  const addEntry = useCallback(async (data: Omit<Entry, "id" | "createdAt" | "updatedAt">) => { const e = await dbAddEntry(data); await refresh(); return e; }, [refresh]);
  const updateEntry = useCallback(async (id: string, data: Partial<Omit<Entry, "id" | "createdAt">>) => { const e = await dbUpdateEntry(id, data); await refresh(); return e; }, [refresh]);
  const deleteEntry = useCallback(async (id: string) => { await dbDeleteEntry(id); await refresh(); }, [refresh]);

  // ── Plate mutations ──
  const addPlate = useCallback(async (plate: string, model?: string, color?: string) => { const p = await dbAddPlate(plate, model || "", color || ""); await refresh(); return p; }, [refresh]);
  const updatePlate = useCallback(async (id: string, plate: string, model?: string, color?: string) => { const p = await dbUpdatePlate(id, plate, model, color); await refresh(); return p; }, [refresh]);
  const deletePlate = useCallback(async (id: string) => { await dbDeletePlate(id); await refresh(); }, [refresh]);

  // ── Maintenance record mutations ──
  const addMaintenanceRecord = useCallback(async (data: Omit<MaintenanceRecord, "id" | "createdAt">) => { const r = await dbAddMaintenanceRecord(data); await refresh(); return r; }, [refresh]);
  const updateMaintenanceRecord = useCallback(async (id: string, data: Partial<Omit<MaintenanceRecord, "id" | "createdAt">>) => { const r = await dbUpdateMaintenanceRecord(id, data); await refresh(); return r; }, [refresh]);
  const deleteMaintenanceRecord = useCallback(async (id: string) => { await dbDeleteMaintenanceRecord(id); await refresh(); }, [refresh]);

  const seedData = useCallback(async () => { await seedSampleData(); await refresh(); }, [refresh]);

  const value = React.useMemo<DataContextValue>(
    () => ({ entries, plates, latestRecords, allRecords, loading, addEntry, updateEntry, deleteEntry, addPlate, updatePlate, deletePlate, addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord, refresh, seedData }),
    [entries, plates, latestRecords, allRecords, loading, addEntry, updateEntry, deleteEntry, addPlate, updatePlate, deletePlate, addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord, refresh, seedData]
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
