// Application constants
export const APP_NAME = 'Al-Noor Cables';

export const DEFAULT_PAGE_SIZE = 20;

// Generate sale number: SALE-YYYYMMDD-XXXXX
export function generateSaleNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SALE-${dateStr}-${random}`;
}
