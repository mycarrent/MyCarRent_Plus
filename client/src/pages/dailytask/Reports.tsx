/**
 * Reports Page — Summary & Reports with daily/weekly/monthly views
 * Design: Category breakdown cards, grand total, period switching
 * Changed: "รายได้" → "รายจ่าย", added "other" category
 */
import { useState, useMemo, useRef } from "react";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import html2canvas from "html2canvas";
import {
  CATEGORIES,
  CATEGORY_LIST,
  formatPriceFull,
  formatDate,
  formatDateShort,
  getTodayStr,
  getWeekRange,
  getMonthRange,
  summarizeByCategory,
  totalIncome,
  entriesToCSV,
  entriesToText,
} from "@/lib/utils-app";
import type { Category } from "@/lib/db";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  Download,
  Copy,
  Share2,
  FileSpreadsheet,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import DailyChart from "@/components/DailyChart";

type Period = "daily" | "weekly" | "monthly";

export default function Reports() {
  const { entries } = useData();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<Period>("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const dateRange = useMemo(() => {
    switch (period) {
      case "daily":
        return { start: selectedDate, end: selectedDate };
      case "weekly":
        return getWeekRange(selectedDate);
      case "monthly":
        return getMonthRange(selectedDate);
    }
  }, [period, selectedDate]);

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (e) => e.date >= dateRange.start && e.date <= dateRange.end
      ),
    [entries, dateRange]
  );

  const summary = useMemo(
    () => summarizeByCategory(filteredEntries),
    [filteredEntries]
  );

  const total = useMemo(() => totalIncome(filteredEntries), [filteredEntries]);

  const bestCategory = useMemo(() => {
    const best = summary.reduce(
      (max, s) => (s.total > max.total ? s : max),
      summary[0]
    );
    return best?.total > 0 ? best : null;
  }, [summary]);

  // Chart data for the period
  const chartData = useMemo(() => {
    const days: { date: string; total: number; wash: number; delivery: number; pickup: number; other: number }[] = [];
    const start = new Date(dateRange.start + "T00:00:00");
    const end = new Date(dateRange.end + "T00:00:00");
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const dayEntries = filteredEntries.filter((e) => e.date === dateStr);
      days.push({
        date: dateStr,
        total: totalIncome(dayEntries),
        wash: dayEntries.filter((e) => e.category === "wash").reduce((s, e) => s + e.price, 0),
        delivery: dayEntries.filter((e) => e.category === "delivery").reduce((s, e) => s + e.price, 0),
        pickup: dayEntries.filter((e) => e.category === "pickup").reduce((s, e) => s + e.price, 0),
        other: dayEntries.filter((e) => e.category === "other").reduce((s, e) => s + e.price, 0),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [filteredEntries, dateRange]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case "daily":
        return formatDate(selectedDate);
      case "weekly":
        return `${formatDateShort(dateRange.start)} - ${formatDateShort(dateRange.end)}`;
      case "monthly":
        return new Date(selectedDate + "T00:00:00").toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        });
    }
  }, [period, selectedDate, dateRange]);

  // Export functions
  const handleCopyText = () => {
    const text = entriesToText(filteredEntries, periodLabel);
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกข้อความแล้ว");
  };

  const handleExportCSV = () => {
    const csv = entriesToCSV(filteredEntries);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-car-rent-report-${dateRange.start}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลด CSV แล้ว");
  };

  const handleShareText = async () => {
    const text = entriesToText(filteredEntries, periodLabel);
    if (navigator.share) {
      try {
        await navigator.share({ text, title: "My Car Rent Report" });
      } catch (err: unknown) {
        // User cancelled share — ignore
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("ไม่สามารถแชร์ได้");
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      toast.success("คัดลอกข้อความแล้ว (เบราว์เซอร์ไม่รองรับการแชร์)");
    }
  };

  const handleShareImage = async () => {
    try {
      // Get appropriate logo URL based on current theme
      // Light mode uses dark logo for contrast, dark mode uses light logo for contrast
      const logoUrl = theme === 'dark'
        ? 'https://d2xsxph8kpxj0f.cloudfront.net/310519663425640557/j5JV53bGTkum5pVxfdkZtn/mycarrent-logo-light_b760179d.png'
        : 'https://d2xsxph8kpxj0f.cloudfront.net/310519663425640557/j5JV53bGTkum5pVxfdkZtn/mycarrent-logo-dark_1acf4109.png';
      
      // Create clean HTML template without OKLCH colors
      const templateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: white; color: #1a1a1a; line-height: 1.6; }
            .container { max-width: 900px; margin: 0 auto; padding: 20px 15px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 2px solid #F97316; padding-bottom: 12px; }
            .header-left { display: flex; align-items: center; gap: 8px; }
            .logo { height: 40px; width: auto; }
            .logo-img { height: 100%; width: auto; max-width: 60px; }
            .title { font-size: 16px; font-weight: 700; margin: 0; }
            .header-right { text-align: right; }
            .date { font-size: 14px; color: #666; font-weight: 600; margin: 0; }
            .content-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .category-section { margin-bottom: 0; border: 1px solid #eee; border-radius: 6px; overflow: hidden; }
            .category-header { display: flex; align-items: center; gap: 8px; margin-bottom: 0; padding: 10px; background: #f5f5f5; border-radius: 0; border-left: 3px solid #F97316; }
            .category-icon { font-size: 20px; }
            .category-title { font-weight: 700; font-size: 14px; flex: 1; }
            .category-count { font-size: 12px; color: #666; }
            .entry-item { display: flex; flex-direction: column; padding: 8px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
            .entry-row { display: flex; justify-content: space-between; align-items: center; }
            .entry-plate { font-weight: 600; color: #333; min-width: 60px; }
            .entry-price { font-weight: 600; color: #F97316; text-align: right; min-width: 80px; }
            .entry-note { font-size: 11px; color: #999; margin-top: 2px; font-style: italic; }
            .category-total { display: flex; justify-content: space-between; padding: 10px; background: #fff9f5; border-radius: 0; margin-top: 0; font-weight: 700; font-size: 12px; border-top: 1px solid #f0f0f0; }
            .grand-total { display: flex; justify-content: space-between; padding: 14px 15px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; border-radius: 6px; margin-top: 12px; font-weight: 700; font-size: 14px; grid-column: 1 / -1; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <div class="logo"><img class="logo-img" src="${logoUrl}" alt="Logo" /></div>
              </div>
              <div class="header-right">
                <div class="date">${periodLabel}</div>
              </div>
            </div>
            
            <div class="content-wrapper">
              ${summary
                .map((s) => {
                  const config = CATEGORIES[s.category];
                  const categoryEntries = filteredEntries.filter((e) => e.category === s.category);
                  return `
                    <div class="category-section">
                      <div class="category-header">
                        <div class="category-icon">${config.icon}</div>
                        <div class="category-title">${config.label}</div>
                        <div class="category-count">${s.count}</div>
                      </div>
                      ${categoryEntries
                        .map(
                          (entry) => `
                        <div class="entry-item">
                          <div class="entry-row">
                            <div class="entry-plate">${entry.customTitle || entry.plate || 'อื่นๆ'}</div>
                            <div class="entry-price">฿${formatPriceFull(entry.price)}</div>
                          </div>
                          ${entry.note ? `<div class="entry-note">${entry.note}</div>` : ''}
                        </div>
                      `
                        )
                        .join('')}
                      <div class="category-total">
                        <span>รวม</span>
                        <span style="color: ${config.color};">฿${formatPriceFull(s.total)}</span>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
            
            <div class="grand-total">
              <span>💰 รวมทั้งหมด ${filteredEntries.length} งาน</span>
              <span>฿${formatPriceFull(total)}</span>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Calculate dynamic height based on entries
      const estimatedHeight = 150 + summary.reduce((acc, s) => {
        const categoryEntries = filteredEntries.filter((e) => e.category === s.category);
        // Each entry: 45px base + 20px if has note
        const entryHeight = categoryEntries.reduce((sum, e) => sum + (e.note ? 65 : 45), 0);
        return acc + 60 + entryHeight + 50;
      }, 0) + 80;
      const iframeHeight = Math.max(1200, estimatedHeight + 150); // Increased buffer
      
      // Create iframe to render template
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "800px";
      iframe.style.height = `${iframeHeight}px`;
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      
      try {
        // Write HTML to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) throw new Error("ไม่สามารถเข้าถึง iframe document");
        
        iframeDoc.open();
        iframeDoc.write(templateHTML);
        iframeDoc.close();
        
        // Wait for iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Fallback timeout
          setTimeout(resolve, 1000);
        });
        
        // Capture iframe body
        const iframeBody = iframeDoc.body;
        if (!iframeBody) throw new Error("ไม่สามารถหา iframe body");
        
        const canvas = await html2canvas(iframeBody, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
          width: 800,
          height: iframeHeight,
        });
        
        const url = canvas.toDataURL("image/png");
        
        // Try to share image if Web Share API supports it
        if (navigator.share && navigator.canShare) {
          try {
            const blob = await (await fetch(url)).blob();
            const file = new File([blob], `my-car-rent-report-${dateRange.start}.png`, { type: "image/png" });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: "My Car Rent Report",
                text: `รายงาน ${periodLabel}`,
              });
              toast.success("แชร์รูปภาพแล้ว");
              return;
            }
          } catch (err: unknown) {
            // Fallback to download if share fails
            if (err instanceof Error && err.name !== "AbortError") {
              console.log("Share API not available, falling back to download");
            }
          }
        }
        
        // Fallback: download image
        const link = document.createElement("a");
        link.href = url;
        link.download = `my-car-rent-report-${dateRange.start}.png`;
        link.click();
        toast.success("ดาวน์โหลดรูปภาพแล้ว");
      } finally {
        document.body.removeChild(iframe);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`ไม่สามารถส่งออกรูปภาพได้: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const exportCardRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    try {
      // Create clean HTML template without OKLCH colors
      const templateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: white; color: #1a1a1a; line-height: 1.6; }
            .container { max-width: 900px; margin: 0 auto; padding: 20px 15px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 2px solid #F97316; padding-bottom: 12px; }
            .header-left { display: flex; align-items: center; gap: 8px; }
            .logo { font-size: 28px; }
            .title { font-size: 16px; font-weight: 700; margin: 0; }
            .header-right { text-align: right; }
            .date { font-size: 14px; color: #666; font-weight: 600; margin: 0; }
            .content-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .category-section { margin-bottom: 0; border: 1px solid #eee; border-radius: 6px; overflow: hidden; }
            .category-header { display: flex; align-items: center; gap: 8px; margin-bottom: 0; padding: 10px; background: #f5f5f5; border-radius: 0; border-left: 3px solid #F97316; }
            .category-icon { font-size: 20px; }
            .category-title { font-weight: 700; font-size: 14px; flex: 1; }
            .category-count { font-size: 12px; color: #666; }
            .entry-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
            .entry-plate { font-weight: 600; color: #333; min-width: 60px; }
            .entry-price { font-weight: 600; color: #F97316; text-align: right; min-width: 80px; }
            .category-total { display: flex; justify-content: space-between; padding: 10px; background: #fff9f5; border-radius: 0; margin-top: 0; font-weight: 700; font-size: 12px; border-top: 1px solid #f0f0f0; }
            .grand-total { display: flex; justify-content: space-between; padding: 14px 15px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; border-radius: 6px; margin-top: 12px; font-weight: 700; font-size: 14px; grid-column: 1 / -1; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <div class="logo">🚗</div>
                <div class="title">My Car Rent</div>
              </div>
              <div class="header-right">
                <div class="date">${periodLabel}</div>
              </div>
            </div>
            
            <div class="content-wrapper">
              ${summary
                .map((s) => {
                  const config = CATEGORIES[s.category];
                  const categoryEntries = filteredEntries.filter((e) => e.category === s.category);
                  return `
                    <div class="category-section">
                      <div class="category-header">
                        <div class="category-icon">${config.icon}</div>
                        <div class="category-title">${config.label}</div>
                        <div class="category-count">${s.count}</div>
                      </div>
                      ${categoryEntries
                        .map(
                          (entry) => `
                        <div class="entry-item">
                          <div class="entry-plate">${entry.plate}</div>
                          <div class="entry-price">฿${formatPriceFull(entry.price)}</div>
                        </div>
                      `
                        )
                        .join("")}
                      <div class="category-total">
                        <span>รวม</span>
                        <span style="color: ${config.color};">฿${formatPriceFull(s.total)}</span>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
            
            <div class="grand-total">
              <span>💰 รวมทั้งหมด ${filteredEntries.length} งาน</span>
              <span>฿${formatPriceFull(total)}</span>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Calculate dynamic height based on entries
      // Header: ~150px, each category header: ~60px, each entry: ~45px, category total: ~50px, grand total: ~80px
      const estimatedHeight = 150 + summary.reduce((acc, s) => {
        const categoryEntries = filteredEntries.filter((e) => e.category === s.category);
        return acc + 60 + (categoryEntries.length * 45) + 50;
      }, 0) + 80;
      const iframeHeight = Math.max(1000, estimatedHeight + 100); // Add 100px buffer
      
      // Create iframe to render template
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "800px";
      iframe.style.height = `${iframeHeight}px`;
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      
      try {
        // Write HTML to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) throw new Error("ไม่สามารถเข้าถึง iframe document");
        
        iframeDoc.open();
        iframeDoc.write(templateHTML);
        iframeDoc.close();
        
        // Wait for iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Fallback timeout
          setTimeout(resolve, 1000);
        });
        
        // Capture iframe body
        const iframeBody = iframeDoc.body;
        if (!iframeBody) throw new Error("ไม่สามารถหา iframe body");
        
        const canvas = await html2canvas(iframeBody, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
          width: 800,
          height: iframeHeight,
        });
        
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `my-car-rent-report-${dateRange.start}.png`;
        link.click();
        toast.success("ดาวน์โหลดรูปภาพแล้ว");
      } finally {
        document.body.removeChild(iframe);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`ไม่สามารถส่งออกรูปภาพได้: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="page-enter pb-6">
      <h1 className="text-2xl font-bold mb-4">รายงาน</h1>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "daily" as Period, label: "รายวัน", icon: CalendarDays },
          { key: "weekly" as Period, label: "รายสัปดาห์", icon: CalendarRange },
          { key: "monthly" as Period, label: "รายเดือน", icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 clean-btn text-sm py-2.5 flex items-center justify-center gap-1.5 ${
              period === key
                ? "bg-orange-500 text-white"
                : "bg-card"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Date Selector */}
      <div className="mb-5">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-card num-display"
        />
        <p className="text-xs text-muted-foreground mt-1 px-1">{periodLabel}</p>
      </div>

      {/* Export Card (for image capture) */}
      <div ref={exportCardRef} className="bg-white p-4 rounded-lg">
        {/* Grand Total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="clean-card p-5 mb-4 text-white"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
        >
          <p className="text-sm opacity-80 mb-1">รวมรายจ่ายทั้งหมด</p>
          <p className="text-3xl font-bold num-display">{formatPriceFull(total)}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm opacity-70">
              {filteredEntries.length} รายการ
            </span>
            {bestCategory && (
              <span className="flex items-center gap-1 text-sm">
                <Award className="w-4 h-4" style={{ color: CATEGORIES[bestCategory.category].color }} />
                <span style={{ color: CATEGORIES[bestCategory.category].color }}>
                  {CATEGORIES[bestCategory.category].label}
                </span>
              </span>
            )}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <div className="space-y-3 mb-5 stagger-children">
          {summary.map((s) => {
            const config = CATEGORIES[s.category];
            const pct = total > 0 ? Math.round((s.total / total) * 100) : 0;
            return (
              <motion.div
                key={s.category}
                whileTap={{ scale: 0.98 }}
                className="clean-card p-4"
                style={{ borderColor: config.color }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{config.label}</span>
                      <span className="num-display font-bold">
                        {formatPriceFull(s.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                      </div>
                      <span className="text-xs num-display text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.count} รายการ
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="clean-card p-4 mb-5">
          <h2 className="text-sm font-semibold mb-3">กราฟรายจ่าย</h2>
          <DailyChart data={chartData} />
        </div>
      )}

      {/* Export Buttons */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          ส่งออกรายงาน
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyText}
            className="clean-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
          >
            <Copy className="w-5 h-5" />
            <span>คัดลอก</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShareText}
            className="clean-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
            title="แชร์ข้อความ"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">แชร์ (ข้อความ)</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShareImage}
            className="clean-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
            title="แชร์รูปภาพ"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">แชร์ (รูปภาพ)</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="clean-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>CSV</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
