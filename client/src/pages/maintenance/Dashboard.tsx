/**
 * Maintenance Dashboard — Shows latest check per plate
 * Sorted by most recent first. Each plate can have multiple records.
 */
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { DashboardStatsComponent } from "@/components/DashboardStats";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Wrench } from "lucide-react";
import type { VehicleStatus } from "@/lib/db";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { plates, latestRecords, deleteMaintenanceRecord } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");

  // Map plate → model from shared plates store
  const plateInfo = useMemo(() => {
    const m = new Map<string, string>();
    plates.forEach((p) => m.set(p.plate, `${p.model}${p.color ? ` · ${p.color}` : ""}`));
    return m;
  }, [plates]);

  const stats = useMemo(() => ({
    total: latestRecords.length,
    normalCount: latestRecords.filter((r) => r.status === "normal").length,
    approachingCount: latestRecords.filter((r) => r.status === "approaching").length,
    overdueCount: latestRecords.filter((r) => r.status === "overdue").length,
  }), [latestRecords]);

  const filtered = useMemo(() => {
    return latestRecords.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || r.record.licensePlate.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [latestRecords, searchQuery, statusFilter]);

  const handleDelete = async (id: string) => {
    try { await deleteMaintenanceRecord(id); toast.success("ลบรายการสำเร็จ"); }
    catch { toast.error("เกิดข้อผิดพลาด"); }
  };

  return (
    <>
      <DashboardStatsComponent stats={stats} />

      {/* Search + Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ค้นหาทะเบียนรถ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VehicleStatus | "all")}>
          <SelectTrigger><SelectValue placeholder="สถานะทั้งหมด" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="normal">ปกติ</SelectItem>
            <SelectItem value="approaching">ใกล้ถึงกำหนด</SelectItem>
            <SelectItem value="overdue">เกินกำหนด</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add button */}
      <Button onClick={() => navigate("/maintenance/vehicles/new")} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md">
        <Plus className="w-4 h-4 mr-2" />เพิ่ม เช็คระยะ
      </Button>

      {/* Vehicle list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">{latestRecords.length === 0 ? "ยังไม่มีรายการเช็คระยะ กดเพิ่มเพื่อเริ่มต้น" : "ไม่พบรายการที่ค้นหา"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filtered.map(({ record, status }) => (
            <VehicleCard
              key={record.id}
              licensePlate={record.licensePlate}
              record={record}
              status={status}
              plateModel={plateInfo.get(record.licensePlate)}
              onEdit={(id) => navigate(`/maintenance/vehicles/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
