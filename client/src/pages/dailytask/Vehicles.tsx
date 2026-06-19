/**
 * Vehicles Page — Manage license plates (add, edit, delete)
 * Design: Simple list with neo-brutalist cards
 * Shows model and color info for each plate
 */
import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { formatPriceFull } from "@/lib/utils-app";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  Save,
  Hash,
} from "lucide-react";
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

export default function Vehicles() {
  const { plates, entries, addPlate, updatePlate, deletePlate } = useData();

  const [showAdd, setShowAdd] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newColor, setNewColor] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Stats per plate
  const plateStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    for (const e of entries) {
      if (!e.plate) continue;
      if (!stats[e.plate]) stats[e.plate] = { count: 0, total: 0 };
      stats[e.plate].count++;
      stats[e.plate].total += e.price;
    }
    return stats;
  }, [entries]);

  const handleAdd = async () => {
    if (!newPlate.trim()) {
      toast.error("กรุณาใส่ทะเบียนรถ");
      return;
    }
    // Check duplicate
    if (plates.some((p) => p.plate === newPlate.trim())) {
      toast.error("ทะเบียนรถนี้มีอยู่แล้ว");
      return;
    }
    await addPlate(newPlate.trim(), newModel.trim(), newColor.trim());
    setNewPlate("");
    setNewModel("");
    setNewColor("");
    setShowAdd(false);
    toast.success("เพิ่มทะเบียนรถสำเร็จ");
  };

  const handleEdit = async () => {
    if (!editId || !editValue.trim()) return;
    await updatePlate(editId, editValue.trim(), editModel.trim(), editColor.trim());
    setEditId(null);
    setEditValue("");
    setEditModel("");
    setEditColor("");
    toast.success("แก้ไขสำเร็จ");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePlate(deleteId);
    setDeleteId(null);
    toast.success("ลบสำเร็จ");
  };

  return (
    <div className="page-enter pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">ทะเบียนรถ</h1>
          <p className="text-sm text-muted-foreground">{plates.length} คัน</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          className="clean-btn bg-orange-500 text-white flex items-center gap-1.5 text-sm py-2.5"
        >
          <Plus className="w-4 h-4" />
          เพิ่ม
        </motion.button>
      </div>

      {plates.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-16 h-16 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">ยังไม่มีทะเบียนรถ</p>
          <p className="text-sm text-muted-foreground mt-1">
            กดปุ่ม "เพิ่ม" เพื่อเพิ่มทะเบียนรถ
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {plates.map((plate) => {
              const stats = plateStats[plate.plate] || { count: 0, total: 0 };
              return (
                <motion.div
                  key={plate.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="clean-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base">{plate.plate}</p>
                      {(plate.model || plate.color) && (
                        <p className="text-xs text-muted-foreground">
                          {plate.model}{plate.model && plate.color ? " · " : ""}{plate.color}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {stats.count} รายการ
                        </span>
                        <span className="num-display">
                          {formatPriceFull(stats.total)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditId(plate.id);
                          setEditValue(plate.plate);
                          setEditModel(plate.model || "");
                          setEditColor(plate.color || "");
                        }}
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(plate.id)}
                        className="w-9 h-9 rounded-lg border border-destructive text-destructive flex items-center justify-center hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="clean-card !rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>เพิ่มทะเบียนรถใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">ทะเบียนรถ</label>
              <Input
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                placeholder="เช่น กก 1234"
                className="text-lg py-5 border"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">รุ่นรถ (ไม่บังคับ)</label>
              <Input
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="เช่น City Turbo, Yaris Ativ"
                className="border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">สี (ไม่บังคับ)</label>
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="เช่น ขาว, ดำ, เทา"
                className="border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-1" />
              เพิ่ม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent className="clean-card !rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>แก้ไขทะเบียนรถ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">ทะเบียนรถ</label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-lg py-5 border"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">รุ่นรถ</label>
              <Input
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                placeholder="เช่น City Turbo"
                className="border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">สี</label>
              <Input
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                placeholder="เช่น ขาว"
                className="border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit}>
              <Save className="w-4 h-4 mr-1" />
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="clean-card !rounded-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบทะเบียนรถนี้หรือไม่? รายการที่เกี่ยวข้องจะไม่ถูกลบ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
