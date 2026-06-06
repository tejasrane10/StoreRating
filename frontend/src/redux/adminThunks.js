import { API_BASE } from '../services/api';
import {
  addUser,
  addStore,
  addAdmin,
  backendUsersRequested,
  backendUsersReceived,
  backendUsersFailed,
  dashboardStatsRequested,
  dashboardStatsReceived,
  dashboardStatsFailed,
  storesRequested,
  storesReceived,
  storesFailed,
  refreshAdminStats,
} from './adminSlice';

export function fetchAdminUsers() {
  return async (dispatch, getState) => {
    try {
      dispatch(backendUsersRequested());

      const token = getState().auth?.token;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load users');
      }

      const data = await res.json();
      const users = Array.isArray(data) ? data : (data.data || []);
      dispatch(backendUsersReceived(users));
      return data;
    } catch (error) {
      dispatch(backendUsersFailed(error.message || 'Failed to load users'));
      console.error('Fetch admin users failed', error);
      return null;
    }
  };
}

export function fetchAdminDashboardStats() {
  return async (dispatch, getState) => {
    try {
      dispatch(dashboardStatsRequested());

      const token = getState().auth?.token;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load dashboard stats');
      }

      const data = await res.json();
      dispatch(dashboardStatsReceived({
        totalUsers: Number(data.totalUsers ?? 0),
        totalStores: Number(data.totalStores ?? 0),
        totalRatings: Number(data.totalRatings ?? 0),
      }));
      return data;
    } catch (error) {
      dispatch(dashboardStatsFailed(error.message || 'Failed to load dashboard stats'));
      console.error('Fetch dashboard stats failed', error);
      return null;
    }
  };
}

export function fetchAdminStores() {
  return async (dispatch, getState) => {
    try {
      dispatch(storesRequested());

      const token = getState().auth?.token;
      const headers = {};
      // If token exists call admin endpoint, otherwise call public stores endpoint
      const path = token ? `${API_BASE}/admin/stores` : `${API_BASE}/stores`;
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(path, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load stores');
      }

      const data = await res.json();
      const stores = Array.isArray(data) ? data : (data.data || []);
      dispatch(storesReceived(stores));
      return data;
    } catch (error) {
      dispatch(storesFailed(error.message || 'Failed to load stores'));
      console.error('Fetch admin stores failed', error);
      return null;
    }
  };
}

export function addUserAsync(payload) {
  return async (dispatch, getState) => {
    try {
      const body = {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        address: payload.address,
        role: payload.role,
        status: payload.status,
      };

      const token = getState().auth?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Add user failed', err);
        return;
      }

      const data = await res.json();
      // Dispatch local state update
      dispatch(addUser(payload));
      dispatch(fetchAdminUsers());
      dispatch(fetchAdminDashboardStats());
      return data;
    } catch (err) {
      console.error('Add user error', err);
    }
  };
}

export function addStoreAsync(payload) {
  return async (dispatch, getState) => {
    try {
      const body = {
        storeName: payload.storeName,
        storeEmail: payload.storeEmail,
        storeAddress: payload.storeAddress,
        ownerId: payload.ownerId,
        status: payload.status,
        storeDescription: payload.storeDescription,
        storeCategory: payload.storeCategory,
      };

      const token = getState().auth?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/stores`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Add store failed', err);
        return;
      }

      const data = await res.json();
      dispatch(addStore({ ...payload, owner: payload.owner }));
      dispatch(fetchAdminUsers());
      dispatch(fetchAdminDashboardStats());
      return data;
    } catch (err) {
      console.error('Add store error', err);
    }
  };
}

export function addAdminAsync(payload) {
  return async (dispatch, getState) => {
    try {
      const body = {
        fullName: payload.fullName || payload.adminName || payload.name,
        email: payload.email,
        password: payload.password,
        address: payload.address,
        role: 'admin',
        permissions: payload.permissions,
      };

      const token = getState().auth?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Add admin failed', err);
        return;
      }

      const data = await res.json();
      dispatch(addAdmin({
        fullName: body.fullName,
        email: body.email,
        address: body.address,
        password: body.password,
        permissions: payload.permissions,
      }));
      dispatch(fetchAdminUsers());
      dispatch(fetchAdminDashboardStats());
      return data;
    } catch (err) {
      console.error('Add admin error', err);
    }
  };
}
