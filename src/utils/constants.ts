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

// Generate batch ID: ALN-YYYYMMDD-###
export function generateBatchId(date?: Date): string {
  const targetDate = date || new Date();
  const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '');
  // Get count of batches for this date to generate sequential number
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ALN-${dateStr}-${random}`;
}