import { User } from "firebase/auth";
import { useSyncExternalStore } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@src/config/firebaseConfig";
import type { SystemUser } from "@root/types/user";

interface StoreState {
  user: User | null;
  systemUser: SystemUser | null;
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
    systemUser: null,
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
    setUser: async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            store.setState({
              ...store.state,
              user,
              systemUser: userDoc.data() as SystemUser,
            });
          } else {
            console.error("User document not found in Firestore");
            store.setState({ ...store.state, user, systemUser: null });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          store.setState({ ...store.state, user, systemUser: null });
        }
      } else {
        store.setState({ ...store.state, user: null, systemUser: null });
      }
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
