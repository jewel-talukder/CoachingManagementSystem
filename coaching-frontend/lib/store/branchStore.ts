import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Branch {
  id: number;
  coachingId: number;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isDefault: boolean;
}

interface BranchStore {
  branches: Branch[];
  selectedBranch: Branch | null;
  setBranches: (branches: Branch[]) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  getDefaultBranch: () => Branch | null;
}

export const useBranchStore = create<BranchStore>()(
  persist(
    (set, get) => ({
      branches: [],
      selectedBranch: null,
      setBranches: (branches) => {
        set({ branches });
        // Auto-select default branch if no branch is selected
        const { selectedBranch } = get();
        if (!selectedBranch && branches.length > 0) {
          const defaultBranch = branches.find((b) => b.isDefault) || branches[0];
          set({ selectedBranch: defaultBranch });
        }
      },
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      getDefaultBranch: () => {
        const { branches } = get();
        return branches.find((b) => b.isDefault) || branches[0] || null;
      },
    }),
    {
      name: 'branch-storage',
    }
  )
);

