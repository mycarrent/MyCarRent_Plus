/**
 * Edit Maintenance Record — Edit existing check record
 */
import { useLocation, useRoute } from "wouter";
import { useData } from "@/contexts/DataContext";
import { VehicleForm, type RecordFormData } from "@/components/VehicleForm";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function EditVehicle() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/maintenance/vehicles/:id");
  const { allRecords, updateMaintenanceRecord } = useData();

  if (!match) return null;
  const record = allRecords.find((r) => r.id === params?.id);

  if (!record) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4"><AlertCircle className="w-8 h-8 text-destructive" /></div>
        <h1 className="text-2xl font-bold text-foreground mb-2">ไม่พบรายการ</h1>
        <p className="text-muted-foreground mb-6">ไม่พบรายการเช็คระยะที่ต้องการแก้ไข</p>
        <Button onClick={() => navigate("/maintenance")} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">กลับไป</Button>
      </div>
    );
  }

  const handleSubmit = async (data: RecordFormData) => {
    await updateMaintenanceRecord(record.id, {
      licensePlate: data.licensePlate,
      date: data.date,
      maintenanceStage: data.maintenanceStage,
      notes: data.notes || "",
    });
    navigate("/maintenance");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">แก้ไข เช็คระยะ</h2>
        <p className="text-sm text-muted-foreground mt-1">{record.licensePlate} · ระยะ {record.maintenanceStage}</p>
      </div>
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <VehicleForm record={record} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
