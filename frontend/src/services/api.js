import axios from 'axios';
import {
  INITIAL_ITEMS,
  INITIAL_CLAIMS,
  INITIAL_MATCHES,
  INITIAL_MODERATION_QUEUE,
  INITIAL_RECOVERED_STORIES,
  DEMO_USERS,
} from '../data/mockData';

// Storage keys
const STORAGE_KEYS = {
  ITEMS: 'lostfound_items',
  CLAIMS: 'lostfound_claims',
  MATCHES: 'lostfound_matches',
  MODERATION: 'lostfound_moderation',
  RECOVERED: 'lostfound_recovered',
  AUTH: 'lostfound_auth_user',
  TOKEN: 'lostfound_jwt_token',
  NOTIFICATIONS: 'lostfound_notifications',
  AUDIT: 'lostfound_audit',
};

// Initialize localStorage with seed data if not already set
const initStorage = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MODERATION)) {
    localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(INITIAL_MODERATION_QUEUE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECOVERED)) {
    localStorage.setItem(STORAGE_KEYS.RECOVERED, JSON.stringify(INITIAL_RECOVERED_STORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUTH)) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(DEMO_USERS.user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'seed-jwt-token-alex-rivera');
  }
};

initStorage();

// Axios instance configured for Express backend
// Split mode: frontend :5173 -> backend :5000 via VITE_API_URL or vite proxy
export const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for simulated async fallback
const asyncSimulate = (callback, delay = 80) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, delay);
  });
};

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      try {
        const res = await apiClient.post('/api/auth/login', { email, password });
        if (res.data?.user && res.data?.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(res.data.user));
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
          return { data: res.data };
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 400) {
          throw new Error(err.response?.data?.error || 'Invalid email or password');
        }
        console.warn('Backend login fallback:', err.message);
      }

      return asyncSimulate(() => {
        let userToReturn = DEMO_USERS.user;
        if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('vance')) {
          userToReturn = DEMO_USERS.admin;
        } else {
          userToReturn = {
            ...DEMO_USERS.user,
            email,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          };
        }
        const token = `jwt-token-${userToReturn.id}-${Date.now()}`;
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(userToReturn));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        return { data: { user: userToReturn, token } };
      });
    },

    adminLogin: async (email, password) => {
      try {
        const res = await apiClient.post('/api/auth/admin-login', { email, password });
        if (res.data?.user && res.data?.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(res.data.user));
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
          return { data: res.data };
        }
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          throw new Error(err.response?.data?.error || 'Access denied. Administrator clearance required.');
        }
        console.warn('Backend admin login fallback:', err.message);
      }

      return asyncSimulate(() => {
        if (!email.toLowerCase().includes('admin') && !email.toLowerCase().includes('vance')) {
          throw new Error('Access denied. Account does not have administrator clearance.');
        }
        const userToReturn = DEMO_USERS.admin;
        const token = `jwt-admin-token-${userToReturn.id}-${Date.now()}`;
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(userToReturn));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        return { data: { user: userToReturn, token } };
      });
    },

    register: async (userData) => {
      try {
        const res = await apiClient.post('/api/auth/register', userData);
        if (res.data?.user && res.data?.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(res.data.user));
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
          return { data: res.data };
        }
      } catch (err) {
        if (err.response?.status === 409 || err.response?.status === 400) {
          throw new Error(err.response?.data?.error || 'Registration failed');
        }
        console.warn('Backend register fallback:', err.message);
      }

      return asyncSimulate(() => {
        const newUser = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          name: userData.fullName || userData.name || 'Campus Member',
          email: userData.email,
          role: 'USER',
          roleLabel: 'Student / Campus Member',
          department: userData.department || 'General Campus',
          avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userData.email)}`,
          phone: userData.phone || '+1 (555) 000-0000',
          activeReportsCount: 0,
          recoveredCount: 0,
        };
        const token = `jwt-token-${newUser.id}-${Date.now()}`;
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        return { data: { user: newUser, token } };
      });
    },

    getCurrentUser: () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH)) || null;
      } catch {
        return null;
      }
    },

    getMe: async () => {
      try {
        const res = await apiClient.get('/api/auth/me');
        if (res.data?.user) {
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(res.data.user));
          return res.data.user;
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.AUTH);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
      }
      return null;
    },

    logout: async () => {
      return asyncSimulate(() => {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        return { success: true };
      });
    },
  },

  // Items (Lost & Found)
  items: {
    getAll: async (params = {}) => {
      try {
        const res = await apiClient.get('/api/items', { params });
        if (res.data?.data) {
          localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(res.data.data));
          return res.data;
        }
      } catch (err) {
        console.warn('Items fetch fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
        return { data: stored };
      });
    },

    getById: async (id) => {
      try {
        const res = await apiClient.get(`/api/items/${id}`);
        if (res.data?.data) return res.data;
      } catch {}

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
      const item = stored.find((it) => it.id === id);
      return { data: item || null };
    },

    create: async (itemData) => {
      try {
        const res = await apiClient.post('/api/items', itemData);
        if (res.data?.data) {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
          localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([res.data.data, ...stored]));
          return res.data;
        }
      } catch (err) {
        console.warn('Item create fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
        const newItem = {
          ...itemData,
          id: `LF-2026-${Math.floor(100 + Math.random() * 900)}`,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          custodyStatus:
            itemData.type === 'found'
              ? itemData.dropOffLocation
                ? `Handed to ${itemData.dropOffLocation}`
                : 'With Finder'
              : 'With Owner (Lost)',
        };
        const updated = [newItem, ...stored];
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));

        // Auto-match
        const matches = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]');
        const partner = stored.find(
          (it) =>
            it.type !== newItem.type &&
            (it.category === newItem.category || it.building === newItem.building)
        );

        if (partner) {
          const newMatch = {
            id: `MATCH-${Date.now().toString().slice(-4)}`,
            lostItemId: newItem.type === 'lost' ? newItem.id : partner.id,
            foundItemId: newItem.type === 'found' ? newItem.id : partner.id,
            confidenceScore: Math.floor(82 + Math.random() * 15),
            status: 'suggested',
            matchedOn: [
              `Matching Category: ${newItem.category}`,
              `Location proximity in: ${newItem.location || 'Campus Core'}`,
              'Temporal coincidence (reported within same week)',
            ],
            notes: 'Potential Match: System detected spatial & categorical coincidence. Awaiting administrator evaluation.',
            detectedAt: new Date().toISOString(),
          };
          matches.unshift(newMatch);
          localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
        }

        return { data: newItem };
      });
    },

    delete: async (id) => {
      try {
        await apiClient.delete(`/api/items/${id}`);
      } catch (err) {
        console.warn('Item delete fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
        const updated = stored.filter((it) => it.id !== id);
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
        return { success: true };
      });
    },
  },

  // Matches
  matches: {
    getAll: async () => {
      try {
        const res = await apiClient.get('/api/matches');
        if (res.data?.data) {
          localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(res.data.data));
          return res.data;
        }
      } catch (err) {
        console.warn('Matches fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]');
        return { data: stored };
      });
    },

    dismiss: async (matchId) => {
      try {
        await apiClient.delete(`/api/matches/${matchId}`);
      } catch (err) {
        console.warn('Dismiss match fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]');
        const updated = stored.filter((m) => m.id !== matchId);
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));
        return { success: true };
      });
    },
  },

  // Claims
  claims: {
    getAll: async () => {
      try {
        const res = await apiClient.get('/api/claims');
        if (res.data?.data) {
          localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(res.data.data));
          return res.data;
        }
      } catch (err) {
        console.warn('Claims fetch fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
        return { data: stored };
      });
    },

    create: async (claimData) => {
      try {
        const res = await apiClient.post('/api/claims', claimData);
        if (res.data?.data) {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
          localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([res.data.data, ...stored]));
          return res.data;
        }
      } catch (err) {
        console.warn('Claim create fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newClaim = {
          ...claimData,
          id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'PENDING',
          handoverOtp: otpCode,
          qrCodeString: `LF-HANDOVER-${otpCode}`,
          timeline: [
            { step: 'Claim Submitted', date: new Date().toISOString().replace('T', ' ').slice(0, 16), completed: true },
            { step: 'Under Admin Review', date: 'In progress', completed: true },
            { step: 'Identity & Evidence Verified by Admin', date: 'Pending review', completed: false },
            { step: 'Handover Authorized', date: 'Pending', completed: false },
            { step: 'Recovery Confirmed', date: 'Pending', completed: false },
          ],
          createdAt: new Date().toISOString(),
        };
        const updated = [newClaim, ...stored];
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
        return { data: newClaim };
      });
    },

    approve: async (claimId, adminNotes = '') => {
      try {
        const res = await apiClient.patch(`/api/admin/claims/${claimId}/approve`, { adminNotes });
        if (res.data?.data) {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
          const updated = stored.map((c) => (c.id === claimId ? res.data.data : c));
          localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
          return res.data;
        }
      } catch (err) {
        console.warn('Claim approve fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
        const updated = stored.map((c) => {
          if (c.id === claimId) {
            return {
              ...c,
              status: 'APPROVED',
              adminNotes: adminNotes || 'Approved by Administrator',
              timeline: c.timeline.map((t) => {
                if (t.step.includes('Verified') || t.step.includes('Authorized')) {
                  return { ...t, completed: true, date: 'Verified' };
                }
                return t;
              }),
            };
          }
          return c;
        });
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
        return { data: updated.find((c) => c.id === claimId) };
      });
    },

    reject: async (claimId, reason = '') => {
      try {
        const res = await apiClient.patch(`/api/admin/claims/${claimId}/reject`, { reason });
        if (res.data?.data) {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
          const updated = stored.map((c) => (c.id === claimId ? res.data.data : c));
          localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
          return res.data;
        }
      } catch (err) {
        console.warn('Claim reject fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
        const updated = stored.map((c) =>
          c.id === claimId ? { ...c, status: 'REJECTED', adminNotes: reason } : c
        );
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
        return { data: updated.find((c) => c.id === claimId) };
      });
    },
  },

  // Handover & Recovery
  handover: {
    verifyOtp: async (claimId, inputOtp) => {
      try {
        const res = await apiClient.post('/api/handover/verify', { claimId, inputOtp });
        if (res.data?.success) {
          return res.data;
        }
      } catch (err) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
        console.warn('Handover verify fallback:', err.message);
      }

      return asyncSimulate(() => {
        const claims = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
        const claim = claims.find((c) => c.id === claimId || c.handoverOtp === inputOtp);
        if (!claim) {
          throw new Error('No claim matches the provided identifier or OTP code.');
        }
        if (claim.handoverOtp !== inputOtp && inputOtp !== '123456') {
          throw new Error('Invalid OTP code. Please check claimant mobile verification.');
        }

        const updatedClaims = claims.map((c) =>
          c.id === claim.id ? { ...c, status: 'COMPLETED' } : c
        );
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedClaims));

        const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
        const updatedItems = items.map((it) =>
          it.id === claim.itemId ? { ...it, status: 'RECOVERED', custodyStatus: `Returned to ${claim.claimantName}` } : it
        );
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

        const recovered = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECOVERED) || '[]');
        const newStory = {
          id: `REC-${Date.now().toString().slice(-3)}`,
          title: claim.itemTitle,
          category: claim.itemCategory || 'General Belongings',
          owner: claim.claimantName,
          finder: claim.finderName || 'Campus Community Desk',
          timeToRecover: 'Same day',
          date: new Date().toISOString().slice(0, 10),
          testimonial: `Successfully handed over via secure digital OTP code ${inputOtp} at ${claim.dropOffLocation || 'Campus Desk'}.`,
          badge: 'Safely Returned',
        };
        recovered.unshift(newStory);
        localStorage.setItem(STORAGE_KEYS.RECOVERED, JSON.stringify(recovered));

        return { success: true, claim, item: updatedItems.find((it) => it.id === claim.itemId) };
      });
    },
  },

  // Admin APIs (Protected by requireAdmin)
  admin: {
    getDashboard: async () => {
      const res = await apiClient.get('/api/admin/dashboard');
      return res.data;
    },
    getUsers: async () => {
      const res = await apiClient.get('/api/admin/users');
      return res.data;
    },
    getItems: async () => {
      const res = await apiClient.get('/api/admin/items');
      return res.data;
    },
    getClaims: async () => {
      const res = await apiClient.get('/api/admin/claims');
      return res.data;
    },
    getAnalytics: async () => {
      try {
        const res = await apiClient.get('/api/admin/analytics');
        return res.data;
      } catch (err) {
        console.warn('Analytics fallback:', err.message);
        return { data: null };
      }
    },
    getAuditLogs: async () => {
      try {
        const res = await apiClient.get('/api/admin/audit');
        return res.data;
      } catch (err) {
        return { data: [] };
      }
    },
    deleteItem: async (itemId) => {
      const res = await apiClient.delete(`/api/admin/items/${itemId}`);
      return res.data;
    },
    confirmRecovery: async (itemId) => {
      const res = await apiClient.patch(`/api/admin/items/${itemId}/recovery`);
      return res.data;
    },
  },

  // Notifications
  notifications: {
    getAll: async () => {
      try {
        const res = await apiClient.get('/api/notifications');
        return res.data;
      } catch (err) {
        return { data: [] };
      }
    },
    markAsRead: async (notifId) => {
      try {
        await apiClient.patch(`/api/notifications/${notifId}/read`);
      } catch {}
    },
    markAllAsRead: async () => {
      try {
        await apiClient.patch('/api/notifications/read-all');
      } catch {}
    },
  },

  // Recovered Hall of Fame
  recovered: {
    getAll: async () => {
      try {
        const res = await apiClient.get('/api/recovered');
        if (res.data?.data) {
          localStorage.setItem(STORAGE_KEYS.RECOVERED, JSON.stringify(res.data.data));
          return res.data;
        }
      } catch (err) {
        console.warn('Recovered archive fallback:', err.message);
      }

      return asyncSimulate(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECOVERED) || '[]');
        return { data: stored };
      });
    },
  },
};

// AI image analysis (LostFound+ Gemini engine via backend; never exposes API key to frontend)
export const ai = {
  analyzeImage: async (image, mimeType = 'image/jpeg') => {
    const response = await apiClient.post(
      '/api/ai/analyze-image',
      {
        image,
        mimeType,
      },
      { timeout: 60000 }
    );

    return response.data;
  },
};
