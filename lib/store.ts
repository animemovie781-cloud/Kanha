import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchHistoryItem {
  id: string;
  type: 'tv' | 'movie';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season: number;
  episode: number;
  timestamp: number;
  progress: number; // 0-100
  duration: number;
}

interface WatchStore {
  history: WatchHistoryItem[];
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  getHistoryItem: (id: string) => WatchHistoryItem | undefined;
}

export const useWatchStore = create<WatchStore>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (item) => set((state) => {
        const existingIndex = state.history.findIndex(h => h.id === item.id);
        const newHistory = [...state.history];
        if (existingIndex >= 0) {
          newHistory[existingIndex] = { ...newHistory[existingIndex], ...item, timestamp: Date.now() };
        } else {
          newHistory.unshift({ ...item, timestamp: Date.now() });
        }
        return { history: newHistory.sort((a, b) => b.timestamp - a.timestamp) };
      }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),
      getHistoryItem: (id) => get().history.find(h => h.id === id)
    }),
    {
      name: 'cinestream-watch-history'
    }
  )
);
