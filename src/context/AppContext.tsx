import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Transaction, Card, UserRole, AppState, FinancialSummary, CategorySpending, BalanceTrend, Insights } from '../types';
import { transactionsApi, cardsApi } from '../services/api';
import { useAuth } from './AuthContext';
import { mockTransactions, mockCards } from '../data/mockData';

type AppAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; transaction: Transaction } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_FILTERS'; payload: Partial<AppState['filters']> }
  | { type: 'SET_SORT'; payload: { sortBy: AppState['sortBy']; sortOrder: AppState['sortOrder'] } }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  transactions: [],
  cards: [],
  userRole: 'viewer',
  darkMode: true,
  filters: {
    category: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  },
  sortBy: 'date',
  sortOrder: 'desc'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    case 'ADD_CARD':
      return { ...state, cards: [action.payload, ...state.cards] };
    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter(c => c.id !== action.payload) };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload.transaction : t
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  financialSummary: FinancialSummary;
  categorySpending: CategorySpending[];
  balanceTrend: BalanceTrend[];
  insights: Insights;
  filteredTransactions: Transaction[];
  isDbLoading: boolean;
  // Auth-aware CRUD
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCard: (c: Omit<Card, 'id'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppProviderInner({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isDbLoading, setIsDbLoading] = React.useState(false);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // Persist dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('finance_darkmode');
    if (savedDarkMode !== null) {
      const dark = savedDarkMode === 'true';
      if (dark !== state.darkMode) {
        dispatch({ type: 'LOAD_STATE', payload: { darkMode: dark } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('finance_darkmode', String(state.darkMode));
  }, [state.darkMode]);

  // Apply dark mode class to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Sync user role from JWT
  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER_ROLE', payload: user.role });
    } else {
      dispatch({ type: 'SET_USER_ROLE', payload: 'viewer' });
    }
  }, [user]);

  // Load transactions and cards
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      setIsDbLoading(true);
      
      const loadData = async () => {
        try {
          const [transactions, cards] = await Promise.all([
            transactionsApi.getAll(),
            cardsApi.getAll()
          ]);
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
          dispatch({ type: 'SET_CARDS', payload: cards });
        } catch (err) {
          console.error('Failed to load data from DB:', err);
          dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
          dispatch({ type: 'SET_CARDS', payload: [] });
        } finally {
          setIsDbLoading(false);
        }
      };

      loadData();
    } else {
      // Not authenticated — show mock data
      dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
      dispatch({ type: 'SET_CARDS', payload: mockCards });
    }
  }, [isAuthenticated, authLoading]);

  // ── Auth-aware CRUD operations ──

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (isAuthenticated && user?.role === 'admin') {
      const created: Transaction = await transactionsApi.create(t);
      dispatch({ type: 'ADD_TRANSACTION', payload: created });
      
      // Refetch cards to update balances from DB
      try {
        const updatedCards = await cardsApi.getAll();
        dispatch({ type: 'SET_CARDS', payload: updatedCards });
      } catch (err) {
        console.error('Failed to sync cards after transaction:', err);
      }
    } else {
      // Mock mode
      const newId = Math.random().toString(36).substr(2, 9);
      const newTransaction = { ...t, id: newId };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction as Transaction });
      
      if (t.cardId) {
        const updatedCards = state.cards.map(c => {
          if (c.id === t.cardId) {
            return {
              ...c,
              balance: t.type === 'income' ? c.balance + t.amount : c.balance - t.amount
            };
          }
          return c;
        });
        dispatch({ type: 'SET_CARDS', payload: updatedCards });
      }
    }
  }, [isAuthenticated, user, state.cards]);

  const updateTransaction = useCallback(async (id: string, t: Transaction) => {
    if (isAuthenticated && user?.role === 'admin') {
      const updated: Transaction = await transactionsApi.update(id, t);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, transaction: updated } });

      // Refetch cards to update balances from DB
      try {
        const updatedCards = await cardsApi.getAll();
        dispatch({ type: 'SET_CARDS', payload: updatedCards });
      } catch (err) {
        console.error('Failed to sync cards after transaction update:', err);
      }
    } else {
      // Mock mode
      const oldTransaction = state.transactions.find(tx => tx.id === id);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, transaction: t } });
      
      if (oldTransaction) {
        let updatedCards = [...state.cards];
        
        // Revert old
        if (oldTransaction.cardId) {
          updatedCards = updatedCards.map(c => 
            c.id === oldTransaction.cardId 
              ? { ...c, balance: oldTransaction.type === 'income' ? c.balance - oldTransaction.amount : c.balance + oldTransaction.amount }
              : c
          );
        }
        
        // Apply new
        if (t.cardId) {
          updatedCards = updatedCards.map(c => 
            c.id === t.cardId 
              ? { ...c, balance: t.type === 'income' ? c.balance + t.amount : c.balance - t.amount }
              : c
          );
        }
        dispatch({ type: 'SET_CARDS', payload: updatedCards });
      }
    }
  }, [isAuthenticated, user, state.transactions, state.cards]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (isAuthenticated && user?.role === 'admin') {
      await transactionsApi.delete(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });

      // Refetch cards to update balances from DB
      try {
        const updatedCards = await cardsApi.getAll();
        dispatch({ type: 'SET_CARDS', payload: updatedCards });
      } catch (err) {
        console.error('Failed to sync cards after transaction deletion:', err);
      }
    } else {
      // Mock mode
      const transaction = state.transactions.find(tx => tx.id === id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      
      if (transaction?.cardId) {
        const updatedCards = state.cards.map(c => 
          c.id === transaction.cardId 
            ? { ...c, balance: transaction.type === 'income' ? c.balance - transaction.amount : c.balance + transaction.amount }
            : c
        );
        dispatch({ type: 'SET_CARDS', payload: updatedCards });
      }
    }
  }, [isAuthenticated, user, state.transactions, state.cards]);

  const addCard = useCallback(async (c: Omit<Card, 'id'>) => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    const created: Card = await cardsApi.create(c);
    dispatch({ type: 'ADD_CARD', payload: created });
  }, [isAuthenticated, user]);

  const deleteCard = useCallback(async (id: string) => {
    if (!isAuthenticated || user?.role !== 'admin' || !id || id === 'undefined') return;
    await cardsApi.delete(id);
    dispatch({ type: 'DELETE_CARD', payload: id });
  }, [isAuthenticated, user]);

  // ── Computed values ──

  const financialSummary: FinancialSummary = React.useMemo(() => {
    const income = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = state.transactions
      .filter(t => t.type === 'income')
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = state.transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
      monthlyIncome,
      monthlyExpenses
    };
  }, [state.transactions]);

  const categorySpending: CategorySpending[] = React.useMemo(() => {
    const expensesByCategory = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [state.transactions]);

  const balanceTrend: BalanceTrend[] = React.useMemo(() => {
    const sortedTransactions = [...state.transactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const trend: BalanceTrend[] = [];
    let runningBalance = 0;

    sortedTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      trend.push({ date: transaction.date, balance: runningBalance });
    });

    return trend;
  }, [state.transactions]);

  const insights: Insights = React.useMemo(() => {
    const highestSpending = categorySpending[0]?.category || 'N/A';

    const monthlyComparison = financialSummary.monthlyIncome > 0
      ? ((financialSummary.monthlyIncome - financialSummary.monthlyExpenses) / financialSummary.monthlyIncome) * 100
      : 0;

    const averageTransaction = state.transactions.length > 0
      ? state.transactions.reduce((sum, t) => sum + t.amount, 0) / state.transactions.length
      : 0;

    const savingsRate = financialSummary.totalIncome > 0
      ? ((financialSummary.totalIncome - financialSummary.totalExpenses) / financialSummary.totalIncome) * 100
      : 0;

    return {
      highestSpendingCategory: highestSpending,
      monthlyComparison,
      averageTransaction,
      savingsRate
    };
  }, [state.transactions, categorySpending, financialSummary]);

  const filteredTransactions: Transaction[] = React.useMemo(() => {
    let filtered = [...state.transactions];

    if (state.filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === state.filters.category);
    }

    if (state.filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === state.filters.type);
    }

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.transactions, state.filters, state.sortBy, state.sortOrder]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      financialSummary,
      categorySpending,
      balanceTrend,
      insights,
      filteredTransactions,
      isDbLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCard,
      deleteCard
    }}>
      {children}
    </AppContext.Provider>
  );
}

// AppProvider wraps with AuthProvider dependency — AuthProvider must be above this
export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AppProviderInner>{children}</AppProviderInner>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
