/**
 * LoadingScreen — Full-screen loading state with app icon
 * Uses local icon for offline support
 */
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center"
      >
        <img
          src="/icon-512.png"
          alt="My Car Rent"
          className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-lg"
        />
        <p className="text-sm text-muted-foreground font-medium">กำลังโหลด...</p>
        <motion.div
          className="w-16 h-1.5 rounded-full mx-auto mt-4 bg-primary"
          animate={{ scaleX: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
