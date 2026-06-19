/**
 * Hub Landing Page — 3 cards linking to each sub-app
 * Design aligned with dailytask's orange/white theme
 */
import { useLocation } from "wouter";
import {
  ClipboardList,
  Calculator,
  Wrench,
  ArrowRight,
} from "lucide-react";

const APPS = [
  {
    key: "daily",
    title: "บันทึกค่าใช้จ่าย",
    desc: "บันทึกรายรับ-รายจ่ายรายวัน ล้างรถ ส่งรถ เก็บรถ และอื่นๆ",
    icon: ClipboardList,
    route: "/daily",
    gradient: "from-orange-500 to-amber-500",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    key: "pricing",
    title: "คำนวณราคาเช่า",
    desc: "คำนวณค่าเช่ารถ สร้างใบเสนอราคา พร้อม copy ส่งลูกค้าได้ทันที",
    icon: Calculator,
    route: "/pricing",
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    key: "maintenance",
    title: "เช็คระยะรถ",
    desc: "ติดตามรอบซ่อมบำรุงรถแต่ละคัน ไม่พลาดนัดเช็คระยะ",
    icon: Wrench,
    route: "/maintenance",
    gradient: "from-sky-500 to-blue-500",
    bgLight: "bg-sky-50",
    textColor: "text-sky-600",
  },
];

export default function HubLanding() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center">
      {/* Branding */}
      <div className="text-center mb-8 mt-2">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          My Car Rent
        </h1>
        <p className="text-muted-foreground text-sm">
          ระบบจัดการงานรถเช่า — เลือกเครื่องมือที่ต้องการใช้งาน
        </p>
      </div>

      {/* App Cards */}
      <div className="w-full space-y-4">
        {APPS.map((app) => (
          <button
            key={app.key}
            onClick={() => navigate(app.route)}
            className="w-full text-left clean-card p-5 flex items-center gap-4 group hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
            >
              <app.icon className="w-6 h-6 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base">
                {app.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">
                {app.desc}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground/60 mt-8 text-center">
        ใช้งานได้แม้ไม่มีอินเทอร์เน็ต · PWA Ready
      </p>
    </div>
  );
}
