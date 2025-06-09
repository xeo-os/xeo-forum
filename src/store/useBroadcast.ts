import { create } from 'zustand';

type Callback = (message: unknown) => void;

interface BroadcastState {
    callbacks: Callback[];
    registerCallback: (callback: Callback) => void;
    broadcast: (message: unknown) => void;
    unregisterCallback: (callback: Callback) => void;
}

export const useBroadcast = create<BroadcastState>((set, get) => ({
    callbacks: [],

    registerCallback: (callback: Callback) => {
        set((state) => ({
            callbacks: [...state.callbacks, callback],
        }));
    },

    broadcast: (message: unknown) => {
        get().callbacks.forEach((callback) => callback(message));
    },

    unregisterCallback: (callback: Callback) => {
        set((state) => ({
            callbacks: state.callbacks.filter((cb) => cb !== callback),
        }));
    },
}));
