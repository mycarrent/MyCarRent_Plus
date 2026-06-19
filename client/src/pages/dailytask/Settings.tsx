/**
 * Settings Page — App info, seed sample data, clear data, backup/restore
 * Design: Orange & White theme
 */
import { useState, useEffect, useRef } from "react";
import { useData } from "@/contexts/DataContext";
import { motion } from "framer-motion";
import {
  Database,
  Trash2,
  Smartphone,
  Wifi,
  WifiOff,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
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
import { createBackup, downloadBackupFile, parseBackupFile, restoreBackup, type BackupData } from "@/lib/backup";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/my-car-rent-logo_efb7efea.webp";

export default function Settings() {
  const { seedData, entries, plates, refresh } = useData();
  const [showClear, setShowClear] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSeedData = async () => {
    await seedData();
    toast.success("เพิ่มข้อมูลตัวอย่างสำเร็จ");
  };

  const handleClearData = async () => {
    try {
      // Clear only app-specific data (entries and plates), not all IndexedDB
      const dbName = "my-car-rent-db";
      const request = indexedDB.open(dbName);

      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(["entries", "plates"], "readwrite");
          tx.objectStore("entries").clear();
          tx.objectStore("plates").clear();

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(new Error("Failed to clear data"));
        };

        request.onerror = () => reject(new Error("Failed to open database"));
      });

      setShowClear(false);
      // Refetch data instead of full page reload for better UX
      await refresh();
      toast.success("ล้างข้อมูลสำเร็จ");
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const backup = await createBackup();
      downloadBackupFile(backup);
      toast.success(`สำรองข้อมูลสำเร็จ (${backup.entries.length} รายการ, ${backup.plates.length} ทะเบียน)`);
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      const backup = await parseBackupFile(file);
      setPendingBackup(backup);
      setShowRestore(true);
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRestoring(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmRestore = async () => {
    if (!pendingBackup) return;

    try {
      setIsRestoring(true);
      const result = await restoreBackup(pendingBackup);
      setShowRestore(false);
      setPendingBackup(null);

      // Refetch data instead of full page reload for better UX
      await refresh();
      toast.success(`กู้คืนข้อมูลสำเร็จ (${result.entriesRestored} รายการ, ${result.platesRestored} ทะเบียน)`);
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="page-enter pb-6">
      <h1 className="text-2xl font-bold mb-6">ตั้งค่า</h1>

      {/* App Info */}
      <div className="clean-card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={LOGO_URL}
            alt="My Car Rent"
            className="h-14 w-auto"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
            <p className="text-2xl font-bold num-display text-orange-600">{entries.length}</p>
            <p className="text-xs text-muted-foreground">รายการทั้งหมด</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
            <p className="text-2xl font-bold num-display text-orange-600">{plates.length}</p>
            <p className="text-xs text-muted-foreground">ทะเบียนรถ</p>
          </div>
        </div>
      </div>

      {/* Online Status */}
      <motion.div
        className="clean-card p-4 mb-4 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">ออนไลน์</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">ออฟไลน์</span>
          </>
        )}
      </motion.div>

      {/* Seed Data Button */}
      <motion.button
        onClick={handleSeedData}
        className="w-full clean-card p-4 mb-3 flex items-center gap-3 hover:bg-orange-50 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <Database className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-medium">เพิ่มข้อมูลตัวอย่าง</span>
      </motion.button>

      {/* Backup Button */}
      <motion.button
        onClick={handleBackup}
        disabled={isBackingUp}
        className="w-full clean-card p-4 mb-3 flex items-center gap-3 hover:bg-blue-50 transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        <Download className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium">
          {isBackingUp ? "กำลังสำรองข้อมูล..." : "สำรองข้อมูล"}
        </span>
      </motion.button>

      {/* Restore Button */}
      <motion.button
        onClick={handleRestoreClick}
        disabled={isRestoring}
        className="w-full clean-card p-4 mb-3 flex items-center gap-3 hover:bg-green-50 transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        <Upload className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium">
          {isRestoring ? "กำลังกู้คืนข้อมูล..." : "กู้คืนข้อมูล"}
        </span>
      </motion.button>

      {/* Clear Data Button */}
      <motion.button
        onClick={() => setShowClear(true)}
        className="w-full clean-card p-4 flex items-center gap-3 hover:bg-red-50 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <Trash2 className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium">ล้างข้อมูลทั้งหมด</span>
      </motion.button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClear} onOpenChange={setShowClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ล้างข้อมูลทั้งหมด?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้จะลบข้อมูลทั้งหมด (รายการและทะเบียนรถ) ออกจากอุปกรณ์ของคุณ ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
              ล้างข้อมูล
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestore} onOpenChange={setShowRestore}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>กู้คืนข้อมูล?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBackup && (
                <>
                  ไฟล์สำรองข้อมูลนี้มี {pendingBackup.entries.length} รายการและ {pendingBackup.plates.length} ทะเบียนรถ
                  <br />
                  <br />
                  ข้อมูลจะถูกรวมเข้ากับข้อมูลที่มีอยู่ (ไม่ลบข้อมูลเดิม)
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore} className="bg-green-600 hover:bg-green-700">
              กู้คืนข้อมูล
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
