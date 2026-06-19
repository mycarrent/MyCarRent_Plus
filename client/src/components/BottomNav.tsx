/**
 * BottomNav — Mobile bottom tab navigation for Daily Task sub-app
 * Routes now prefixed with /daily
 */
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  ClipboardList,
  BarChart3,
  MoreHorizontal,
  Car,
  Settings,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/daily", label: "หน้าหลัก", icon: LayoutDashboard },
  { path: "/daily/history", label: "ประวัติ", icon: ClipboardList },
  { path: "/daily/add", label: "เพิ่ม", icon: Plus, isFab: true },
  { path: "/daily/reports", label: "รายงาน", icon: BarChart3 },
  { path: "/daily/more", label: "เพิ่มเติม", icon: MoreHorizontal, isMore: true },
];

const MORE_ITEMS = [
  { path: "/daily/vehicles", label: "ทะเบียนรถ", icon: Car },
  { path: "/daily/settings", label: "ตั้งค่า", icon: Settings },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = ["/daily/vehicles", "/daily/settings"].includes(location);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More menu popup */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          className="fixed bottom-20 right-4 z-50 bg-card rounded-2xl p-1.5 min-w-[160px]"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)" }}
        >
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  setLocation(item.path);
                  setShowMore(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </motion.div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-bottom" style={{ boxShadow: "0 -1px 12px rgba(0,0,0,0.04)" }}>
        <div className="max-w-lg lg:max-w-5xl xl:max-w-7xl mx-auto flex items-end justify-around px-2 pt-1.5 pb-1.5">
          {NAV_ITEMS.map((item) => {
            const active = item.isMore ? isMoreActive : location === item.path;
            const Icon = item.icon;

            if (item.isFab) {
              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative -top-4"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        location === item.path
                          ? "text-primary-foreground"
                          : "bg-card text-primary"
                      }`}
                      style={{
                        background: location === item.path
                          ? "linear-gradient(135deg, #FB923C, #EA580C)"
                          : undefined,
                        boxShadow: location === item.path
                          ? "0 4px 16px rgba(234,88,12,0.35)"
                          : "0 2px 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] font-medium text-center block mt-0.5 ${
                      location === item.path ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            }

            if (item.isMore) {
              return (
                <motion.button
                  key="more"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMore(!showMore)}
                  className="flex flex-col items-center py-1.5 px-2 min-w-[52px]"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      active
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            }

            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center py-1.5 px-2 min-w-[52px]"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      active
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
