import { create } from 'zustand';
import { CompanyPool } from '../../../shared/types/entities';
import { invokeIPC } from '../api/ipc';

interface CompanyPoolState {
  pools: CompanyPool[];
  load: () => Promise<void>;
}

export const useCompanyPoolStore = create<CompanyPoolState>((set) => ({
  pools: [],
  load: async () => set({ pools: await invokeIPC<CompanyPool[]>('referrals:pool') })
}));
