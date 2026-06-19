/**
 * Status Badge Component — Unified orange theme
 * Displays vehicle maintenance status with color coding and icon
 */
import type { VehicleStatus } from "@/lib/db";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: VehicleStatus;
  animated?: boolean;
}

const statusConfig = {
  normal: { label: "ปกติ", color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  approaching: { label: "ใกล้ถึงกำหนด", color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  overdue: { label: "เกินกำหนด", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: AlertCircle },
};

export function StatusBadge({ status, animated = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color} ${animated && status === "approaching" ? "pulse-soft" : ""}`}>
      <Icon className="w-4 h-4" /><span>{config.label}</span>
    </div>
  );
}

interface StatusIndicatorProps { status: VehicleStatus; size?: "sm" | "md" | "lg"; }
const sizeConfig = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };
const colorConfig = { normal: "bg-green-500", approaching: "bg-amber-500", overdue: "bg-red-500" };

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  return <div className={`${sizeConfig[size]} ${colorConfig[status]} rounded-full ${status === "approaching" ? "pulse-soft" : ""}`} />;
}
