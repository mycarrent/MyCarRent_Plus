/** Centralized route constants for the My Car Rent unified app */
export const ROUTES = {
  HUB: "/",
  DAILY: {
    ROOT: "/daily",
    DASHBOARD: "/daily",
    ADD: "/daily/add",
    HISTORY: "/daily/history",
    REPORTS: "/daily/reports",
    VEHICLES: "/daily/vehicles",
    SETTINGS: "/daily/settings",
  },
  PRICING: {
    ROOT: "/pricing",
    CALCULATOR: "/pricing",
  },
  MAINTENANCE: {
    ROOT: "/maintenance",
    DASHBOARD: "/maintenance",
    ADD_VEHICLE: "/maintenance/vehicles/new",
    EDIT_VEHICLE: "/maintenance/vehicles/:id",
  },
} as const;
