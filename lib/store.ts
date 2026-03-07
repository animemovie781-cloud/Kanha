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

export interface SavedItem {
  id: string;
  type: 'tv' | 'movie';
  title: string;
  posterPath: string | null;
  timestamp: number;
  voteAverage?: number;
  releaseDate?: string;
}

interface WatchStore {
  history: WatchHistoryItem[];
  myList: SavedItem[];
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  getHistoryItem: (id: string) => WatchHistoryItem | undefined;
  addToMyList: (item: SavedItem) => void;
  removeFromMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;
}

export const useWatchStore = create<WatchStore>()(
  persist(
    (set, get) => ({
      history: [],
      myList: [],
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
      getHistoryItem: (id) => get().history.find(h => h.id === id),
      addToMyList: (item) => set((state) => {
        if (state.myList.some(i => i.id === item.id)) return state;
        return { myList: [{ ...item, timestamp: Date.now() }, ...state.myList] };
      }),
      removeFromMyList: (id) => set((state) => ({
        myList: state.myList.filter(i => i.id !== id)
      })),
      isInMyList: (id) => get().myList.some(i => i.id === id)
    }),
    {
      name: 'cinestream-watch-history'
    }
  )
);
