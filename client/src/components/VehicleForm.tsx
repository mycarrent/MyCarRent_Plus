/**
 * MaintenanceRecord Form — Add/Edit a maintenance check
 * Select plate (from shared store or custom), date, stage, notes
 */
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MaintenanceRecord } from "@/lib/db";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const recordFormSchema = z.object({
  licensePlate: z.string().min(1, "กรุณากรอกหรือเลือกทะเบียนรถ"),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), "กรุณาเลือกวันที่"),
  maintenanceStage: z.number().int().min(1).max(20),
  notes: z.string().optional(),
});
export type RecordFormData = z.infer<typeof recordFormSchema>;

interface VehicleFormProps {
  record?: MaintenanceRecord;
  onSubmit: (data: RecordFormData) => Promise<void>;
  isLoading?: boolean;
}

export function VehicleForm({ record, onSubmit, isLoading = false }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plateSearch, setPlateSearch] = useState("");
  const { plates, allRecords } = useData();

  // All known plates: shared plates + previously used in maintenance
  const knownPlates = useMemo(() => {
    const set = new Set<string>();
    plates.forEach((p) => set.add(p.plate));
    allRecords.forEach((r) => set.add(r.licensePlate));
    return Array.from(set).sort();
  }, [plates, allRecords]);

  const filteredPlates = useMemo(() => {
    if (!plateSearch) return knownPlates.slice(0, 24);
    const q = plateSearch.toLowerCase();
    return knownPlates.filter((p) => p.toLowerCase().includes(q)).slice(0, 24);
  }, [knownPlates, plateSearch]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RecordFormData>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: record ? {
      licensePlate: record.licensePlate,
      date: record.date,
      maintenanceStage: record.maintenanceStage,
      notes: record.notes || "",
    } : {
      licensePlate: "",
      date: new Date().toISOString().split("T")[0],
      maintenanceStage: 1,
      notes: "",
    },
  });

  const selectedPlate = watch("licensePlate");
  const selectedStage = watch("maintenanceStage");

  const handleFormSubmit = async (data: RecordFormData) => {
    try { setIsSubmitting(true); await onSubmit(data); }
    catch (e) { toast.error(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* License Plate — quick grid + custom input */}
      <div className="space-y-2">
        <Label>ทะเบียนรถ *</Label>
        <Input
          placeholder="พิมพ์ทะเบียนหรือเลือกจากรายการ..."
          {...register("licensePlate")}
          onChange={(e) => { setValue("licensePlate", e.target.value as any); setPlateSearch(e.target.value); }}
          autoComplete="off"
        />
        {/* Plate quick-select grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 max-h-36 overflow-y-auto">
          {filteredPlates.map((p) => (
            <button key={p} type="button" onClick={() => { setValue("licensePlate", p as any); setPlateSearch(""); }}
              className={`text-left px-2 py-1.5 rounded-md text-xs border transition-colors ${selectedPlate === p ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/30 hover:bg-muted"}`}>
              <span className="font-medium">{p}</span>
            </button>
          ))}
        </div>
        {errors.licensePlate && <p className="text-sm text-destructive">{errors.licensePlate.message}</p>}
      </div>

      {/* Date + Stage */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>วันที่เช็คระยะ *</Label>
          <Input type="date" {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>ระยะที่เช็ค *</Label>
          <Select value={String(selectedStage)} onValueChange={(v) => setValue("maintenanceStage", Number(v) as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((s) => (<SelectItem key={s} value={String(s)}>ระยะ {s}</SelectItem>))}
            </SelectContent>
          </Select>
          {errors.maintenanceStage && <p className="text-sm text-destructive">{errors.maintenanceStage.message}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>หมายเหตุ</Label>
        <Textarea placeholder="เพิ่มหมายเหตุ (ไม่จำเป็น)" {...register("notes")} rows={3} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        {isSubmitting ? "กำลังบันทึก..." : record ? "อัปเดตรายการ" : "บันทึกเช็คระยะ"}
      </Button>
    </form>
  );
}
