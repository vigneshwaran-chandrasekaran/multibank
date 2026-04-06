import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Alert } from "../types";

interface AlertState {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id" | "triggered" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  markTriggered: (id: string) => void;
  clearTriggeredAlerts: () => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      alerts: [],

      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            {
              ...alert,
              id: `${alert.symbol}-${Date.now()}`,
              triggered: false,
              createdAt: Date.now(),
            },
          ],
        })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      markTriggered: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true } : a
          ),
        })),

      clearTriggeredAlerts: () =>
        set((state) => ({
          alerts: state.alerts.filter((a) => !a.triggered),
        })),
    }),
    { name: "trading-alerts" }
  )
);
