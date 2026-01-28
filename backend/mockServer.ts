
import { User, Payment, Notification, UserRole, UserStatus, PaymentStatus, Loan, PaymentType } from '../types';
import { INITIAL_ADMINS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'hub_users',
  PAYMENTS: 'hub_payments',
  NOTIFICATIONS: 'hub_notifications',
  SETTINGS: 'hub_settings',
  LOANS: 'hub_loans'
};

const DEFAULT_SETTINGS = {
  automatedRemindersEnabled: true
};

// Layer 1: BroadcastChannel for explicit internal events
const syncChannel = new BroadcastChannel('CT_HUB_SYNC');

const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS as User[];
    }
    return JSON.parse(data);
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    syncChannel.postMessage({ type: 'DATA_UPDATED', target: 'USERS' });
  },
  getPayments: (): Payment[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]'),
  savePayments: (payments: Payment[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    syncChannel.postMessage({ type: 'DATA_UPDATED', target: 'PAYMENTS' });
  },
  getNotifs: (): Notification[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'),
  saveNotifs: (notifs: Notification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    syncChannel.postMessage({ type: 'DATA_UPDATED', target: 'NOTIFICATIONS' });
  },
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: any) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    syncChannel.postMessage({ type: 'DATA_UPDATED', target: 'SETTINGS' });
  },
  getLoans: (): Loan[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.LOANS) || '[]'),
  saveLoans: (loans: Loan[]) => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    syncChannel.postMessage({ type: 'DATA_UPDATED', target: 'LOANS' });
  }
};

export const mockServer = {
  login: async (jersey: string, pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = db.getUsers();
        const user = users.find(u => u.jerseyNumber?.toUpperCase() === jersey.toUpperCase());
        if (!user) return reject('User not found.');
        if (user.password !== pass) return reject('Incorrect password.');
        if (user.status === UserStatus.PENDING) return reject('Account pending manager approval.');
        if (user.status === UserStatus.REJECTED) return reject('This account has been deactivated by an Admin.');
        
        const updated = users.map(u => u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u);
        db.saveUsers(updated);
        
        resolve({ ...user, lastLogin: new Date().toISOString() });
      }, 600);
    });
  },

  register: async (name: string, email: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = db.getUsers();
        const newUser: User = {
          id: `u-${Date.now()}`,
          name, 
          email,
          role: UserRole.CLIENT,
          status: UserStatus.PENDING,
          isFirstLogin: true,
          registrationDate: new Date().toISOString()
        };
        db.saveUsers([...users, newUser]);
        resolve();
      }, 500);
    });
  },

  updatePassword: async (userId: string, newPass: string): Promise<User> => {
    return new Promise((resolve) => {
      const users = db.getUsers();
      const updated = users.map(u => u.id === userId ? { ...u, password: newPass, isFirstLogin: false } : u);
      db.saveUsers(updated);
      resolve(updated.find(u => u.id === userId)!);
    });
  },

  deleteUser: async (userId: string) => {
    const users = db.getUsers();
    db.saveUsers(users.filter(u => u.id !== userId));
    const payments = db.getPayments();
    db.savePayments(payments.filter(p => p.clientId !== userId));
    const loans = db.getLoans();
    db.saveLoans(loans.filter(l => l.clientId !== userId));
  },

  resetUserPassword: async (userId: string, newPass: string) => {
    const users = db.getUsers();
    db.saveUsers(users.map(u => u.id === userId ? { ...u, password: newPass, isFirstLogin: true } : u));
  },

  approveUser: async (userId: string, jersey: string, pass: string) => {
    const users = db.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, status: UserStatus.APPROVED, jerseyNumber: jersey, password: pass } : u);
    db.saveUsers(updated);
    await mockServer.sendNotification(userId, `Approved! ID: ${jersey}. Login and update password.`);
  },

  rejectUser: async (userId: string) => {
    const users = db.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, status: UserStatus.REJECTED } : u);
    db.saveUsers(updated);
  },

  submitPayment: async (payment: Omit<Payment, 'id' | 'status' | 'date'>) => {
    const payments = db.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: `p-${Date.now()}`,
      status: PaymentStatus.PENDING,
      date: new Date().toISOString()
    };
    db.savePayments([...payments, newPayment]);
  },

  updatePaymentStatus: async (paymentId: string, status: PaymentStatus) => {
    const payments = db.getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (payment && status === PaymentStatus.APPROVED && payment.type === PaymentType.LOAN_REPAYMENT && payment.loanId) {
      const loans = db.getLoans();
      const updatedLoans = loans.map(l => {
        if (l.id === payment.loanId) {
          const newBalance = Math.max(0, l.balance - payment.amount);
          return { 
            ...l, 
            balance: newBalance,
            status: newBalance <= 0 ? 'PAID' : 'ACTIVE' 
          };
        }
        return l;
      });
      db.saveLoans(updatedLoans as Loan[]);
    }

    db.savePayments(payments.map(p => p.id === paymentId ? { ...p, status } : p));
  },

  issueLoan: async (clientId: string, clientName: string, amount: number) => {
    const loans = db.getLoans();
    const upfrontInterest = amount * 0.05;
    const disbursementAmount = amount - upfrontInterest;
    
    const openingDate = new Date();
    const closingDate = new Date();
    closingDate.setMonth(openingDate.getMonth() + 3);

    const newLoan: Loan = {
      id: `l-${Date.now()}`,
      clientId,
      clientName,
      amount: amount, 
      disbursementAmount: disbursementAmount,
      interestAmount: upfrontInterest,
      balance: amount,
      openingDate: openingDate.toISOString(),
      closingDate: closingDate.toISOString(),
      status: 'ACTIVE'
    };

    db.saveLoans([...loans, newLoan]);
    await mockServer.sendNotification(clientId, `Loan issued. Principal: ₦${amount.toLocaleString()}, Disbursed: ₦${disbursementAmount.toLocaleString()}. Next due: ${closingDate.toLocaleDateString()}`);
  },

  processInterest: async () => {
    const loans = db.getLoans();
    const now = new Date();
    let updated = false;

    const updatedLoans = loans.map(l => {
      if (l.status === 'ACTIVE' && l.balance > 0 && new Date(l.closingDate) < now) {
        updated = true;
        const recurringInterest = l.balance * 0.05;
        const newClosing = new Date(l.closingDate);
        newClosing.setMonth(newClosing.getMonth() + 3);
        
        return {
          ...l,
          balance: l.balance + recurringInterest,
          interestAmount: l.interestAmount + recurringInterest,
          closingDate: newClosing.toISOString()
        };
      }
      return l;
    });

    if (updated) {
      db.saveLoans(updatedLoans);
    }
  },

  sendNotification: async (recipientId: string, message: string) => {
    const notifs = db.getNotifs();
    const n: Notification = { id: `n-${Date.now()}`, recipientId, message, date: new Date().toISOString() };
    db.saveNotifs([...notifs, n]);
  },

  updateSettings: async (settings: any) => {
    db.saveSettings(settings);
  },

  getAllData: async () => {
    await mockServer.processInterest();
    return {
      users: db.getUsers(),
      payments: db.getPayments(),
      notifications: db.getNotifs(),
      settings: db.getSettings(),
      loans: db.getLoans()
    };
  }
};
