export const IPC = {
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    CURRENT_USER: 'auth:current-user',
  },
  STOCK: {
    GET_ALL: 'stock:get-all',
    GET_BY_ID: 'stock:get-by-id',
    ADD: 'stock:add',
    UPDATE: 'stock:update',
    DELETE: 'stock:delete',
    GET_ALERTS: 'stock:get-alerts',
    RECORD_SALE: 'stock:record-sale',
    GET_SALES: 'stock:get-sales',
  },
  EXPENSE: {
    GET_ALL: 'expense:get-all',
    ADD: 'expense:add',
    UPDATE: 'expense:update',
    DELETE: 'expense:delete',
    GET_STATS: 'expense:get-stats',
  },
  CATEGORY: {
    GET_ALL: 'category:get-all',
    GET_EXPENSE_CATEGORIES: 'category:get-expense-categories',
  },
} as const;

