/**
 * Add Maintenance Record — Select plate, date, stage, save
 * Same plate can have multiple records at different stages
 */
import { useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { VehicleForm, type RecordFormData } from "@/components/VehicleForm";

export default function AddVehicle() {
  const [, navigate] = useLocation();
  const { addMaintenanceRecord } = useData();

  const handleSubmit = async (data: RecordFormData) => {
    await addMaintenanceRecord({
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">เพิ่ม เช็คระยะ</h2>
        <p className="text-sm text-muted-foreground mt-1">เลือกทะเบียนรถ เลือกวันที่ และระยะที่เช็ค</p>
      </div>
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <VehicleForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
