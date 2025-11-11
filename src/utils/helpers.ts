// Calculate final amount for sale
export function calculateFinalAmount(quantity: number, unitPrice: number, discount: number): number {
  return quantity * unitPrice - discount;
}

// Format currency
export function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

// Format date
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format datetime
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

