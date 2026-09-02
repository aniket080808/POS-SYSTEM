// Native IndexedDB Wrapper for Offline POS Resilience
const DB_NAME = "SmartPos_OfflineDB";
const DB_VERSION = 1;

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Products Cache Store
      if (!db.objectStoreNames.contains("products")) {
        const productStore = db.createObjectStore("products", { keyPath: "id" });
        productStore.createIndex("sku", "sku", { unique: false });
        productStore.createIndex("name", "name", { unique: false });
      }

      // Customers Cache Store
      if (!db.objectStoreNames.contains("customers")) {
        const customerStore = db.createObjectStore("customers", { keyPath: "id" });
        customerStore.createIndex("phone", "phone", { unique: false });
        customerStore.createIndex("fullName", "fullName", { unique: false });
      }

      // Offline Pending Orders Queue
      if (!db.objectStoreNames.contains("pendingOrders")) {
        const orderStore = db.createObjectStore("pendingOrders", { keyPath: "offlineId" });
        orderStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const offlineDb = {
  // --- Products ---
  async cacheProducts(products = []) {
    if (!products || products.length === 0) return;
    const db = await openDatabase();
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");
    products.forEach((p) => {
      if (p && p.id) {
        store.put(p);
      }
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getCachedProducts() {
    const db = await openDatabase();
    const tx = db.transaction("products", "readonly");
    const store = tx.objectStore("products");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  // --- Customers ---
  async cacheCustomers(customers = []) {
    if (!customers || customers.length === 0) return;
    const db = await openDatabase();
    const tx = db.transaction("customers", "readwrite");
    const store = tx.objectStore("customers");
    customers.forEach((c) => {
      if (c && c.id) {
        store.put(c);
      }
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getCachedCustomers() {
    const db = await openDatabase();
    const tx = db.transaction("customers", "readonly");
    const store = tx.objectStore("customers");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  // --- Pending Offline Orders ---
  async queueOfflineOrder(order) {
    const db = await openDatabase();
    const tx = db.transaction("pendingOrders", "readwrite");
    const store = tx.objectStore("pendingOrders");
    
    const offlineId = order.offlineId || `OFF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      ...order,
      offlineId,
      createdAt: order.createdAt || new Date().toISOString(),
      isOfflineSynced: false,
    };
    
    store.put(record);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getPendingOfflineOrders() {
    const db = await openDatabase();
    const tx = db.transaction("pendingOrders", "readonly");
    const store = tx.objectStore("pendingOrders");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async removePendingOfflineOrder(offlineId) {
    const db = await openDatabase();
    const tx = db.transaction("pendingOrders", "readwrite");
    const store = tx.objectStore("pendingOrders");
    store.delete(offlineId);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  async clearPendingOrders() {
    const db = await openDatabase();
    const tx = db.transaction("pendingOrders", "readwrite");
    const store = tx.objectStore("pendingOrders");
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
};
