import { User } from 'firebase/auth';
import { useSyncExternalStore } from 'react';

interface StoreState {
  user: User | null;
  initialized: boolean;
}

interface Store {
  state: StoreState;
  listeners: Set<() => void>;
  getState: () => StoreState;
  setState: (newState: StoreState) => void;
  subscribe: (listener: () => void) => () => void;
  actions: {
    setUser: (user: User | null) => void;
    setInitialized: (initialized: boolean) => void;
  };
}

const store: Store = {
  state: {
    user: null,
    initialized: false,
  },
  listeners: new Set(),
  getState: () => store.state,
  setState: (newState) => {
    store.state = newState;
    store.listeners.forEach((listener) => listener());
  },
  subscribe: (listener) => {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  },
  actions: {
    setUser: (user) => {
      store.setState({ ...store.state, user });
    },
    setInitialized: (initialized) => {
      store.setState({ ...store.state, initialized });
    },
  },
};

export const useAuthStore = (): [StoreState, typeof store.actions] => {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );
  return [state, store.actions];
};