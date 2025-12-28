import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  paymentMode: 'batch' | 'monthly';
  setPaymentMode: (mode: 'batch' | 'monthly') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      paymentMode: 'batch', // Default to batch-wise
      setPaymentMode: (mode) => set({ paymentMode: mode }),
    }),
    {
      name: 'coaching-settings-storage',
    }
  )
);

