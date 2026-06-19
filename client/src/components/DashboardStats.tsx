/**
 * Dashboard Stats — Maintenance overview
 * Shows total, normal, approaching, overdue counts
 */
import { Car, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export interface DashboardStats {
  total: number;
  normalCount: number;
  approachingCount: number;
  overdueCount: number;
}

export function DashboardStatsComponent({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "คันทั้งหมด", value: stats.total, icon: Car, gradient: "from-orange-500/20 to-amber-600/10", iconBg: "bg-orange-500/20", iconColor: "text-orange-600", accent: "from-orange-500 to-amber-600" },
    { label: "ปกติ", value: stats.normalCount, icon: CheckCircle, gradient: "from-green-500/20 to-green-600/10", iconBg: "bg-green-500/20", iconColor: "text-green-600", accent: "from-green-500 to-green-600" },
    { label: "ใกล้ถึง", value: stats.approachingCount, icon: Clock, gradient: "from-amber-500/20 to-amber-600/10", iconBg: "bg-amber-500/20", iconColor: "text-amber-600", accent: "from-amber-500 to-amber-600" },
    { label: "เกินกำหนด", value: stats.overdueCount, icon: AlertTriangle, gradient: "from-red-500/20 to-red-600/10", iconBg: "bg-red-500/20", iconColor: "text-red-600", accent: "from-red-500 to-red-600" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => { const Icon = item.icon; return (
        <div key={i} className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="relative bg-card border border-border/50 p-4 space-y-2">
            <div className={`${item.iconBg} w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}><Icon className={`w-5 h-5 ${item.iconColor}`} /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">{item.label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${item.accent} bg-clip-text text-transparent`}>{item.value}</p>
            <div className={`h-1 w-0 bg-gradient-to-r ${item.accent} rounded-full group-hover:w-full transition-all duration-500`} />
          </div>
        </div>
      )})}
    </div>
  );
}
