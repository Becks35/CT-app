
import { User, Payment, Notification, UserRole, UserStatus, PaymentStatus } from '../types';
// Fix: INITIAL_MANAGER was not exported from constants. Replacing with INITIAL_ADMINS.
import { INITIAL_ADMINS } from '../constants';

const KEYS = {
  USERS: 'ch_users',
  PAYMENTS: 'ch_payments',
  NOTIFICATIONS: 'ch_notifications',
  CURRENT_USER: 'ch_current_user'
};

export const storageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      // Fix: INITIAL_ADMINS is already an array of users.
      const initial = INITIAL_ADMINS as User[];
      localStorage.setItem(KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getPayments: (): Payment[] => {
    const data = localStorage.getItem(KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  },

  savePayments: (payments: Payment[]) => {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  },

  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveNotifications: (notifications: Notification[]) => {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // Auth helper
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }
};
