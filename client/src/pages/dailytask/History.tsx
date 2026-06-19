/**
 * History Page — View, filter, edit, delete entries
 * Design: Grouped by date with clear date headers, filterable, clean light mode
 * Supports "other" category with customTitle display
 */
import { useState, useMemo, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import {
  CATEGORIES,
  CATEGORY_LIST,
  formatPriceFull,
  formatDate,
  getTodayStr,
  getEntryDisplayLabel,
} from "@/lib/utils-app";
import type { Category, Entry } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Save,
  Droplets,
  Truck,
  KeyRound,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  wash: <Droplets className="w-4 h-4" />,
  delivery: <Truck className="w-4 h-4" />,
  pickup: <KeyRound className="w-4 h-4" />,
  other: <ClipboardList className="w-4 h-4" />,
};

export default function History() {
  const { entries, plates, updateEntry, deleteEntry } = useData();

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [filterPlate, setFilterPlate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit state
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("wash");
  const [editPlate, setEditPlate] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCustomTitle, setEditCustomTitle] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...entries];
    if (filterDate) {
      result = result.filter((e) => e.date === filterDate);
    }
    if (filterCategory !== "all") {
      result = result.filter((e) => e.category === filterCategory);
    }
    if (filterPlate !== "all") {
      result = result.filter((e) => e.plate === filterPlate);
    }
    return result;
  }, [entries, filterDate, filterCategory, filterPlate]);

  // Group by date (newest first)
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    for (const entry of filtered) {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    }
    // Sort dates descending (newest first)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, entries]) => ({
        date,
        entries: entries.sort((a, b) => b.createdAt - a.createdAt),
      }));
  }, [filtered]);

  const totalFiltered = useMemo(
    () => filtered.reduce((s, e) => s + e.price, 0),
    [filtered]
  );

  const uniquePlates = useMemo(
    () => Array.from(new Set(entries.map((e) => e.plate).filter(Boolean))).sort(),
    [entries]
  );

  const openEdit = useCallback((entry: Entry) => {
    setEditEntry(entry);
    setEditDate(entry.date);
    setEditCategory(entry.category);
    setEditPlate(entry.plate);
    setEditPrice(String(entry.price));
    setEditNote(entry.note);
    setEditCustomTitle(entry.customTitle || "");
  }, []);

  const handleUpdate = async () => {
    if (!editEntry) return;
    const isOther = editCategory === "other";
    await updateEntry(editEntry.id, {
      date: editDate,
      category: editCategory,
      plate: isOther ? "" : editPlate,
      price: Number(editPrice),
      note: editNote,
      customTitle: isOther ? editCustomTitle : "",
    });
    setEditEntry(null);
    toast.success("แก้ไขสำเร็จ");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEntry(deleteId);
    setDeleteId(null);
    toast.success("ลบสำเร็จ");
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterCategory("all");
    setFilterPlate("all");
  };

  const hasFilters = filterDate || filterCategory !== "all" || filterPlate !== "all";

  return (
    <div className="page-enter pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">ประวัติ</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`clean-btn flex items-center gap-1.5 text-sm py-2 px-3 ${
            hasFilters ? "bg-orange-500 text-white" : "bg-card"
          }`}
        >
          <Filter className="w-4 h-4" />
          กรอง
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </motion.button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="clean-card p-4 mb-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  วันที่
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card num-display"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  ประเภท
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      filterCategory === "all"
                        ? "bg-orange-500 text-white"
                        : "border-border bg-card"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {CATEGORY_LIST.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm border flex items-center gap-1 transition-colors`}
                      style={{
                        borderColor:
                          filterCategory === cat
                            ? CATEGORIES[cat].color
                            : undefined,
                        backgroundColor:
                          filterCategory === cat
                            ? CATEGORIES[cat].bgColor
                            : undefined,
                        color:
                          filterCategory === cat
                            ? CATEGORIES[cat].color
                            : undefined,
                      }}
                    >
                      {CATEGORY_ICONS[cat]}
                      {CATEGORIES[cat].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  ทะเบียนรถ
                </label>
                <select
                  value={filterPlate}
                  onChange={(e) => setFilterPlate(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card appearance-none"
                >
                  <option value="all">ทั้งหมด</option>
                  {uniquePlates.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-muted-foreground">
          {filtered.length} รายการ
        </span>
        <span className="num-display text-sm font-semibold">
          รวม {formatPriceFull(totalFiltered)}
        </span>
      </div>

      {/* Entry List Grouped by Date */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">ไม่พบรายการ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(({ date, entries: dateEntries }) => (
            <div key={date}>
              {/* Date Header */}
              <div className="px-1 mb-2.5">
                <h2 className="text-sm font-semibold text-foreground">
                  {formatDate(date)}
                </h2>
              </div>

              {/* Entries for this date */}
              <div className="space-y-2">
                {dateEntries.map((entry) => {
                  const config = CATEGORIES[entry.category];
                  const displayLabel = getEntryDisplayLabel(entry);
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="clean-card p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {entry.plate ? (
                              <span className="font-medium text-sm">{entry.plate}</span>
                            ) : null}
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: config.bgColor,
                                color: config.color,
                              }}
                            >
                              {displayLabel}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-xs text-muted-foreground">
                              {entry.note}
                            </p>
                          )}
                        </div>
                        <span className="num-display text-sm font-semibold shrink-0">
                          {formatPriceFull(entry.price)}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(entry)}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(entry.id)}
                            className="w-8 h-8 rounded-lg border border-destructive text-destructive flex items-center justify-center hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={() => setEditEntry(null)}>
        <DialogContent className="clean-card !rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>แก้ไขรายการ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                วันที่
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card num-display"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                ประเภท
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEditCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm border flex items-center gap-1 transition-colors`}
                    style={{
                      borderColor:
                        editCategory === cat ? CATEGORIES[cat].color : undefined,
                      backgroundColor:
                        editCategory === cat ? CATEGORIES[cat].bgColor : undefined,
                      color: editCategory === cat ? CATEGORIES[cat].color : undefined,
                    }}
                  >
                    {CATEGORY_ICONS[cat]}
                    {CATEGORIES[cat].label}
                  </button>
                ))}
              </div>
            </div>

            {editCategory !== "other" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  ทะเบียนรถ
                </label>
                <select
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card appearance-none"
                >
                  <option value="">เลือกทะเบียน</option>
                  {Array.from(
                    new Set(
                      entries
                        .filter((e) => e.plate)
                        .map((e) => e.plate)
                    )
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editCategory === "other" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  หัวข้อ
                </label>
                <input
                  type="text"
                  value={editCustomTitle}
                  onChange={(e) => setEditCustomTitle(e.target.value)}
                  placeholder="เช่น ค่าน้ำมัน"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                ราคา (บาท)
              </label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card num-display"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                หมายเหตุ (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="เช่น ล้างแว็กซ์"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditEntry(null)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Save className="w-4 h-4 mr-1.5" />
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="clean-card">
          <AlertDialogHeader>
            <AlertDialogTitle>ลบรายการ?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
