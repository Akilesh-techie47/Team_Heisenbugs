import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { currentUser, role } = useAuth();

  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [recoveredStories, setRecoveredStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, matchesRes, claimsRes, recRes, notifsRes] = await Promise.all([
        api.items.getAll(),
        api.matches.getAll(),
        api.claims.getAll(),
        api.recovered.getAll(),
        api.notifications.getAll(),
      ]);

      setItems(itemsRes.data || []);
      setMatches(matchesRes.data || []);
      setClaims(claimsRes.data || []);
      setRecoveredStories(recRes.data || []);
      setNotifications(notifsRes.data || []);

      // If Admin, load analytics, audit logs, and user directory
      if (role === 'admin') {
        const [analyticsRes, auditRes, usersRes] = await Promise.all([
          api.admin.getAnalytics(),
          api.admin.getAuditLogs(),
          api.admin.getUsers().catch(() => ({ data: [] })),
        ]);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
        if (auditRes.data) setAuditLogs(auditRes.data);
        if (usersRes?.data) setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to load LostFound data:', error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData, currentUser]);

  const createItem = async (itemData) => {
    const res = await api.items.create(itemData);
    await refreshAllData();
    return res.data;
  };

  const createClaim = async (claimData) => {
    const res = await api.claims.create(claimData);
    await refreshAllData();
    return res.data;
  };

  const approveClaim = async (claimId, adminNotes = '') => {
    const res = await api.claims.approve(claimId, adminNotes);
    await refreshAllData();
    return res.data;
  };

  const rejectClaim = async (claimId, reason = '') => {
    const res = await api.claims.reject(claimId, reason);
    await refreshAllData();
    return res.data;
  };

  const deleteItem = async (itemId) => {
    await api.items.delete(itemId);
    await refreshAllData();
  };

  const dismissMatch = async (matchId) => {
    await api.matches.dismiss(matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const executeHandover = async (claimId, otp) => {
    const res = await api.handover.verifyOtp(claimId, otp);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const adminConfirmRecovery = async (itemId) => {
    const res = await api.admin.confirmRecovery(itemId);
    await refreshAllData();
    return res;
  };

  const markNotificationRead = async (notifId) => {
    await api.notifications.markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    await api.notifications.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DataContext.Provider
      value={{
        items,
        matches,
        claims,
        notifications,
        auditLogs,
        analytics,
        users,
        recoveredStories,
        loading,
        refreshAllData,
        createItem,
        createClaim,
        approveClaim,
        rejectClaim,
        dismissMatch,
        executeHandover,
        adminConfirmRecovery,
        deleteItem,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
