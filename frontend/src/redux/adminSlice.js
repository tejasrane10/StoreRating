import { createSlice, nanoid } from '@reduxjs/toolkit';
// initial mock data removed to prefer backend-provided data

const initialState = {
  users: [],
  stores: [],
  dashboardSummary: {
    totalUsers: null,
    totalStores: null,
    totalRatings: null,
  },
  dashboardLoading: false,
  dashboardError: null,
  backendUsers: [],
  backendUsersLoading: false,
  backendUsersError: null,
  storesLoading: false,
  storesError: null,
  notifications: [],
  activities: [],
  lastUpdated: new Date().toISOString(),
};

function nowLabel() {
  return 'Just now';
}

function pushActivity(state, activity) {
  state.activities.unshift({
    id: nanoid(),
    time: nowLabel(),
    dayGroup: 'Today',
    ...activity,
  });
}

function pushNotification(state, notification) {
  state.notifications.unshift({
    id: nanoid(),
    unread: true,
    ...notification,
  });
}

function buildUserRecord(payload, role) {
  return {
    id: nanoid(),
    name: payload.fullName,
    email: payload.email,
    address: payload.address,
    role,
    status: payload.status,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function buildStoreRecord(payload) {
  const owner = payload.owner ?? {};
  return {
    id: nanoid(),
    name: payload.storeName,
    email: payload.storeEmail,
    address: payload.storeAddress,
    rating: Number(payload.rating ?? 0),
    ownerId: owner.id ?? null,
    ownerName: owner.name ?? 'Unassigned',
    ownerEmail: owner.email ?? '',
    status: payload.status,
    createdAt: new Date().toISOString().slice(0, 10),
    totalReviews: 0,
    category: payload.storeCategory || 'General',
    description: payload.storeDescription || '',
    phone: payload.phone || '',
    reviews: [],
  };
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    backendUsersRequested(state) {
      state.backendUsersLoading = true;
      state.backendUsersError = null;
    },
    backendUsersReceived(state, action) {
      state.backendUsersLoading = false;
      state.backendUsers = action.payload;
    },
    backendUsersFailed(state, action) {
      state.backendUsersLoading = false;
      state.backendUsersError = action.payload || 'Failed to load users';
    },
    dashboardStatsRequested(state) {
      state.dashboardLoading = true;
      state.dashboardError = null;
    },
    dashboardStatsReceived(state, action) {
      state.dashboardLoading = false;
      state.dashboardSummary = {
        ...state.dashboardSummary,
        ...action.payload,
      };
    },
    dashboardStatsFailed(state, action) {
      state.dashboardLoading = false;
      state.dashboardError = action.payload || 'Failed to load dashboard stats';
    },
    storesRequested(state) {
      state.storesLoading = true;
      state.storesError = null;
    },
    storesReceived(state, action) {
      state.storesLoading = false;
      state.stores = Array.isArray(action.payload) ? action.payload : [];
    },
    storesFailed(state, action) {
      state.storesLoading = false;
      state.storesError = action.payload || 'Failed to load stores';
    },
    addUser(state, action) {
      const user = buildUserRecord(action.payload, action.payload.role);
      state.users.unshift(user);
      pushActivity(state, { type: 'user', title: 'New user registered', detail: user.email });
      pushNotification(state, { title: 'New User Registered', detail: user.email, time: nowLabel(), color: '#818cf8' });
      state.lastUpdated = new Date().toISOString();
    },
    addStore(state, action) {
      const store = buildStoreRecord(action.payload);
      state.stores.unshift(store);
      pushActivity(state, { type: 'store', title: `Store "${store.name}" added`, detail: store.email });
      pushNotification(state, { title: 'New Store Added', detail: store.name, time: nowLabel(), color: '#4ade80' });
      state.lastUpdated = new Date().toISOString();
    },
    addAdmin(state, action) {
      const user = buildUserRecord(action.payload, 'admin');
      state.users.unshift({
        ...user,
        permissions: action.payload.permissions ?? [],
      });
      pushActivity(state, { type: 'admin', title: 'New admin created', detail: user.email });
      pushNotification(state, { title: 'New Admin Added', detail: user.name, time: nowLabel(), color: '#fb923c' });
      state.lastUpdated = new Date().toISOString();
    },
    updateUser(state, action) {
      const { id, updates } = action.payload;
      const index = state.users.findIndex((user) => user.id === id);
      if (index !== -1) state.users[index] = { ...state.users[index], ...updates };
      state.lastUpdated = new Date().toISOString();
    },
    deleteUser(state, action) {
      state.users = state.users.filter((user) => user.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    updateStore(state, action) {
      const { id, updates } = action.payload;
      const index = state.stores.findIndex((store) => store.id === id);
      if (index !== -1) state.stores[index] = { ...state.stores[index], ...updates };
      state.lastUpdated = new Date().toISOString();
    },
    deleteStore(state, action) {
      state.stores = state.stores.filter((store) => store.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((notification) => {
        notification.unread = false;
      });
    },
    refreshAdminStats(state) {
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  backendUsersRequested,
  backendUsersReceived,
  backendUsersFailed,
  dashboardStatsRequested,
  dashboardStatsReceived,
  dashboardStatsFailed,
  storesRequested,
  storesReceived,
  storesFailed,
  addUser,
  addStore,
  addAdmin,
  updateUser,
  deleteUser,
  updateStore,
  deleteStore,
  markAllNotificationsRead,
  refreshAdminStats,
} = adminSlice.actions;

export default adminSlice.reducer;
