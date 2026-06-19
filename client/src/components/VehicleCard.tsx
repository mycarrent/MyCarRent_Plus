/**
 * MaintenanceCard — Shows latest maintenance record per plate
 * Displays plate, latest stage, date, status badge, edit/delete
 */
import type { MaintenanceRecord, VehicleStatus } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusIndicator } from "@/components/StatusBadge";
import { Edit2, Trash2, Gauge, CalendarDays } from "lucide-react";

interface VehicleCardProps {
  licensePlate: string;
  record: MaintenanceRecord;
  status: VehicleStatus;
  plateModel?: string; // from shared plates
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function VehicleCard({ licensePlate, record, status, plateModel, onEdit, onDelete }: VehicleCardProps) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-card border border-border/50 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-orange-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusIndicator status={status} size="md" />
              <h3 className="text-lg font-bold text-foreground truncate">{licensePlate}</h3>
            </div>
            {plateModel && <p className="text-xs text-muted-foreground">{plateModel}</p>}
          </div>
          <StatusBadge status={status} animated />
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 py-3 px-3 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-lg border border-border/30">
          <div className="space-y-1">
            <div className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-orange-500" /><p className="text-xs font-semibold text-muted-foreground uppercase">ระยะ</p></div>
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{record.maintenanceStage}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-muted-foreground" /><p className="text-xs font-semibold text-muted-foreground uppercase">วันที่เช็ค</p></div>
            <p className="text-sm font-semibold text-foreground">{new Date(record.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}</p>
          </div>
        </div>

        {/* Notes + Actions */}
        <div className="flex items-center gap-2">
          {record.notes ? <p className="flex-1 text-xs text-muted-foreground truncate">{record.notes}</p> : <div className="flex-1" />}
          <Button onClick={() => onEdit?.(record.id)} variant="outline" size="sm" className="border-border/50 hover:border-orange-200 hover:bg-orange-50 transition-colors"><Edit2 className="w-4 h-4" /></Button>
          <Button onClick={() => { if (window.confirm(`ลบรายการเช็คระยะ ${licensePlate} ระยะ ${record.maintenanceStage}?`)) onDelete?.(record.id); }} variant="ghost" size="sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}
