/**
 * AddEntry Page — Task entry form with category selection, plate dropdown, price input
 * Design: Large touch-friendly inputs, bold category selection cards
 * "other" category: shows custom title input, plate is optional
 */
import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { CATEGORIES, CATEGORY_LIST, getTodayStr } from "@/lib/utils-app";
import type { Category } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save, Droplets, Truck, KeyRound, ClipboardList, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  wash: <Droplets className="w-7 h-7" />,
  delivery: <Truck className="w-7 h-7" />,
  pickup: <KeyRound className="w-7 h-7" />,
  other: <ClipboardList className="w-7 h-7" />,
};

const OTHER_SUB_CATEGORIES = [
  {
    id: "fuel",
    label: "ค่าน้ำมัน",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/49_85223_2f0e09d9.webp",
  },
  {
    id: "gas_refill",
    label: "วนเติมน้ำมัน",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/IMG_20260324_001705_57e66920.jpg",
  },
  {
    id: "parking",
    label: "ค่าที่จอดรถ",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/IMG_20260323_221943_0e7804ab.jpg",
  },
];

export default function AddEntry() {
  const { addEntry, plates, addPlate } = useData();

  const [date, setDate] = useState(getTodayStr());
  const [category, setCategory] = useState<Category | null>(null);
  const [plate, setPlate] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNewPlate, setShowNewPlate] = useState(false);
  const [newPlateValue, setNewPlateValue] = useState("");
  const [newPlateModel, setNewPlateModel] = useState("");
  const [newPlateColor, setNewPlateColor] = useState("");

  const isOther = category === "other";

  const handleSave = async () => {
    if (!category) {
      toast.error("กรุณาเลือกประเภทงาน");
      return;
    }
    if (isOther && !customTitle.trim()) {
      toast.error("กรุณาใส่หัวข้อ");
      return;
    }
    if (!isOther && !plate) {
      toast.error("กรุณาเลือกทะเบียนรถ");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("กรุณาใส่ราคา");
      return;
    }

    setSaving(true);
    try {
      await addEntry({
        date,
        category,
        plate: isOther ? "" : plate,
        price: Number(price),
        note,
        customTitle: isOther ? customTitle.trim() : "",
      });
      toast.success("บันทึกสำเร็จ!");
      // Reset form
      setCategory(null);
      setPlate("");
      setPrice("");
      setNote("");
      setCustomTitle("");
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewPlate = async () => {
    if (!newPlateValue.trim()) return;
    await addPlate(newPlateValue.trim(), newPlateModel.trim(), newPlateColor.trim());
    setPlate(newPlateValue.trim());
    setNewPlateValue("");
    setNewPlateModel("");
    setNewPlateColor("");
    setShowNewPlate(false);
    toast.success("เพิ่มทะเบียนรถสำเร็จ");
  };

  return (
    <div className="page-enter pb-6">
      <h1 className="text-2xl font-bold mb-6">เพิ่มรายการ</h1>

      {/* Date Picker */}
      <div className="mb-5">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          วันที่
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="clean-btn w-full text-left bg-card num-display text-base"
        />
      </div>

      {/* Category Selection */}
      <div className="mb-5">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          ประเภทงาน
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_LIST.map((cat) => {
            const config = CATEGORIES[cat];
            const selected = category === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCategory(cat);
                  // Reset plate when switching to/from "other"
                  if (cat === "other") setPlate("");
                  if (cat !== "other") setCustomTitle("");
                }}
                className={`clean-card p-3 text-center transition-all ${
                  selected ? "!bg-orange-50" : ""
                }`}
                style={{
                  borderColor: selected ? config.color : undefined,
                  boxShadow: selected
                    ? `4px 4px 0px ${config.color}`
                    : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5"
                  style={{
                    backgroundColor: selected ? config.color : config.bgColor,
                    color: selected ? "white" : config.color,
                  }}
                >
                  {CATEGORY_ICONS[cat]}
                </div>
                <p className="text-xs font-medium">{config.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sub-categories for "other" */}
      <AnimatePresence>
        {isOther && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              เลือกประเภท (ไม่บังคับ)
            </label>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {OTHER_SUB_CATEGORIES.map((sub) => (
                <motion.button
                  key={sub.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCustomTitle(sub.label)}
                  className="clean-card p-3 text-center transition-all flex-shrink-0 w-[calc(33.333%-6px)]"
                  style={{
                    borderColor: customTitle === sub.label ? CATEGORIES.other.color : undefined,
                    boxShadow: customTitle === sub.label ? `4px 4px 0px ${CATEGORIES.other.color}` : undefined,
                    backgroundColor: customTitle === sub.label ? "#EDE9FE" : undefined,
                  }}
                >
                  <div className="flex justify-center mb-1.5">
                    <img 
                      src={sub.icon} 
                      alt={sub.label}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <p className="text-xs font-medium">{sub.label}</p>
                </motion.button>
              ))}
            </div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              หัวข้อ (จำเป็น)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="เช่น ค่าน้ำมัน, ค่าทางด่วน, ค่าซ่อม..."
              className="clean-btn w-full bg-card text-base"
              style={{ borderColor: CATEGORIES.other.color }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plate Selection (hidden for "other" category) */}
      <AnimatePresence>
        {!isOther && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              ทะเบียนรถ
            </label>
            <div className="flex gap-2">
              <select
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="clean-btn flex-1 bg-card text-sm appearance-none"
              >
                <option value="">เลือกทะเบียนรถ...</option>
                {plates.map((p) => (
                  <option key={p.id} value={p.plate}>
                    {p.plate}{p.model ? ` — ${p.model}` : ""}{p.color ? ` (${p.color})` : ""}
                  </option>
                ))}
              </select>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNewPlate(true)}
                className="clean-btn bg-card flex items-center justify-center w-12"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Input */}
      <div className="mb-5">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          ราคา (บาท)
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="clean-btn w-full bg-card num-display text-xl pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            ฿
          </span>
        </div>
        {/* Quick price buttons */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {[25, 50, 75, 100, 120].map((p) => (
            <button
              key={p}
              onClick={() => setPrice(String(p))}
              className="px-3 py-1.5 rounded-lg text-sm num-display border border-border bg-secondary hover:bg-accent transition-colors"
            >
              ฿{p}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <StickyNote className="w-4 h-4" />
          หมายเหตุ (ไม่บังคับ)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น ล้างภายนอก, ส่งสนามบิน..."
          className="clean-btn w-full bg-card text-base"
        />
      </div>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={saving}
        className="clean-btn w-full text-white text-lg font-semibold flex items-center justify-center gap-2 py-4"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
      >
        <Save className="w-5 h-5" />
        {saving ? "กำลังบันทึก..." : "บันทึก"}
      </motion.button>

      {/* Preview */}
      <AnimatePresence>
        {category && (isOther ? customTitle : plate) && price && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div
              className="clean-card p-4"
              style={{ borderColor: CATEGORIES[category].color }}
            >
              <p className="text-xs text-muted-foreground mb-1">ตัวอย่าง</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORIES[category].icon}</span>
                <div className="flex-1">
                  <p className="font-medium">
                    {isOther ? customTitle : plate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOther ? "อื่นๆ" : CATEGORIES[category].label} · {date}
                  </p>
                </div>
                <span className="num-display text-lg font-bold">
                  ฿{Number(price).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Plate Dialog */}
      <Dialog open={showNewPlate} onOpenChange={setShowNewPlate}>
        <DialogContent className="clean-card !rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>เพิ่มทะเบียนรถใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">ทะเบียนรถ</label>
              <Input
                value={newPlateValue}
                onChange={(e) => setNewPlateValue(e.target.value)}
                placeholder="เช่น กก 1234"
                className="text-lg py-5 border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">รุ่นรถ (ไม่บังคับ)</label>
              <Input
                value={newPlateModel}
                onChange={(e) => setNewPlateModel(e.target.value)}
                placeholder="เช่น City Turbo, Yaris Ativ"
                className="border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">สี (ไม่บังคับ)</label>
              <Input
                value={newPlateColor}
                onChange={(e) => setNewPlateColor(e.target.value)}
                placeholder="เช่น ขาว, ดำ, เทา"
                className="border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlate(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddNewPlate}>เพิ่ม</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
