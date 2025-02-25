import { collection, getDocs } from "firebase/firestore";
import { useSyncExternalStore } from "react";
import { MenuItem, HeaderItem } from "types";
import { db } from "@src/config/firebaseConfig";

interface StoreState {
  clientMenuItems: MenuItem[];
  loadingClientMenu: boolean;
  HeaderItems: HeaderItem[];
  menuItems: MenuItem[];
}

interface Store {
  state: StoreState;
  listeners: Set<() => void>;
  getState: () => StoreState;
  setState: (newState: StoreState) => void;
  subscribe: (listener: () => void) => () => void;
  actions: {
    populateSideBar: () => void;
    populateClientHeader: () => void;
    populateHeader: () => void;
  };
}

const store: Store = {
  state: {
    clientMenuItems: [],
    loadingClientMenu: true,
    HeaderItems: [],
    menuItems: [],
  },
  listeners: new Set(),
  getState: () => {
    return store.state;
  },
  setState: (newState) => {
    store.state = newState;
    store.listeners.forEach((listener) => listener());
  },
  subscribe: (listener) => {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  },
  actions: {
    populateSideBar() {
      fetchMenuItems();
    },
    populateClientHeader() {
      fetchClientHeaderItems();
    },
    populateHeader() {
      fetchHeaderItems();
    },
  },
};

export const useLayoutStore = (): [StoreState, typeof store.actions] => {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState // server snapshot (optional)
  );
  return [state, store.actions];
};

const fetchClientHeaderItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clientHeader"));
    const items: ClientMenuItems[] = querySnapshot.docs
      .map((doc) => ({
        key: doc.id,
        label: doc.data().label,
        path: doc.data().path,
        order: doc.data().order,
      }))
      .sort((a, b) => a.order - b.order);
    store.setState({
      ...store.state,
      clientMenuItems: items,
    });
  } catch (error) {
    console.error("Error fetching client header items:", error);
  } finally {
    store.setState({
      ...store.state,
      loadingClientMenu: false,
    });
  }
};

const fetchHeaderItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "header"));
    if (!querySnapshot.empty) {
      const items: HeaderItem[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as HeaderItem),
      }));

      items.sort((a, b) => a.order - b.order);
      store.setState({
        ...store.state,
        HeaderItems: items,
      });
    }
  } catch (error) {
    console.error("Error fetching header items:", error);
  }
};

const fetchMenuItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "menus"));
    const items: MenuItem[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as MenuItem),
    }));

    items.sort((a, b) => a.order - b.order);
    store.setState({
      ...store.state,
      menuItems: items,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
  }
};
