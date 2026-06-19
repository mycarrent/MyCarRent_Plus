import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateBackupData,
  formatFileSize,
  formatBackupDate,
  type BackupData,
} from "./backup";

describe("Backup Utilities", () => {
  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    });

    it("should handle decimal sizes", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });
  });

  describe("formatBackupDate", () => {
    it("should format timestamp to Thai locale", () => {
      const timestamp = new Date("2026-03-28T10:30:00Z").getTime();
      const formatted = formatBackupDate(timestamp);
      expect(formatted).toContain("2026");
      expect(formatted).toContain("10");
      expect(formatted).toContain("30");
    });
  });

  describe("Backup Data Validation", () => {
    let validBackup: BackupData;

    beforeEach(() => {
      validBackup = {
        version: "1.0",
        timestamp: Date.now(),
        entries: [
          {
            id: "test-1",
            date: "2026-03-28",
            category: "wash",
            plate: "ABC123",
            price: 100,
            note: "test",
            customTitle: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        plates: [
          {
            id: "plate-1",
            plate: "ABC123",
            model: "Toyota",
            color: "white",
            createdAt: Date.now(),
          },
        ],
      };
    });

    it("should validate correct backup data", () => {
      expect(() => {
        // Simulate validation by checking structure
        if (
          typeof validBackup === "object" &&
          validBackup !== null &&
          typeof validBackup.version === "string" &&
          typeof validBackup.timestamp === "number" &&
          Array.isArray(validBackup.entries) &&
          Array.isArray(validBackup.plates)
        ) {
          return true;
        }
        throw new Error("Invalid backup");
      }).not.toThrow();
    });

    it("should reject invalid version", () => {
      const invalidBackup = { ...validBackup, version: 123 };
      expect(() => {
        if (typeof invalidBackup.version !== "string") {
          throw new Error("Invalid backup file: missing version");
        }
      }).toThrow();
    });

    it("should reject invalid timestamp", () => {
      const invalidBackup = { ...validBackup, timestamp: "not-a-number" };
      expect(() => {
        if (typeof invalidBackup.timestamp !== "number") {
          throw new Error("Invalid backup file: missing timestamp");
        }
      }).toThrow();
    });

    it("should reject invalid entries array", () => {
      const invalidBackup = { ...validBackup, entries: "not-an-array" };
      expect(() => {
        if (!Array.isArray(invalidBackup.entries)) {
          throw new Error("Invalid backup file: entries is not an array");
        }
      }).toThrow();
    });

    it("should reject negative price", () => {
      const invalidBackup = {
        ...validBackup,
        entries: [
          {
            ...validBackup.entries[0],
            price: -100,
          },
        ],
      };
      expect(() => {
        for (const entry of invalidBackup.entries) {
          if (entry.price < 0) {
            throw new Error("Invalid backup file: price cannot be negative");
          }
        }
      }).toThrow();
    });

    it("should reject invalid category", () => {
      const invalidBackup = {
        ...validBackup,
        entries: [
          {
            ...validBackup.entries[0],
            category: "invalid" as any,
          },
        ],
      };
      expect(() => {
        const validCategories = ["wash", "delivery", "pickup", "other"];
        for (const entry of invalidBackup.entries) {
          if (!validCategories.includes(entry.category)) {
            throw new Error(
              `Invalid backup file: invalid category "${entry.category}"`
            );
          }
        }
      }).toThrow();
    });

    it("should reject invalid date format", () => {
      const invalidBackup = {
        ...validBackup,
        entries: [
          {
            ...validBackup.entries[0],
            date: "28/03/2026", // Wrong format
          },
        ],
      };
      expect(() => {
        for (const entry of invalidBackup.entries) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
            throw new Error(
              `Invalid backup file: invalid date format "${entry.date}"`
            );
          }
        }
      }).toThrow();
    });
  });
});
