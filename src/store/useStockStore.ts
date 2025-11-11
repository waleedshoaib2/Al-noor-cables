import { create } from 'zustand';
import type { Product, Sale } from '@/types';
import { generateSaleNumber } from '@/utils/constants';
import { calculateFinalAmount } from '@/utils/helpers';

interface StockState {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
  getLowStockProducts: () => Product[];
  recordSale: (sale: Omit<Sale, 'id' | 'saleNo' | 'saleDate' | 'totalAmount' | 'finalAmount'>) => void;
  getSalesHistory: () => Sale[];
}

// Seed sample products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Power Cable 3m',
    sku: 'PC001',
    description: '3 meter power cable',
    costPrice: 100,
    sellingPrice: 150,
    quantity: 50,
    reorderLevel: 10,
    categoryId: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Network Cable CAT6',
    sku: 'NC001',
    description: 'CAT6 ethernet cable',
    costPrice: 50,
    sellingPrice: 80,
    quantity: 100,
    reorderLevel: 20,
    categoryId: 2,
    isActive: true,
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 3,
    name: 'HDMI Cable 2m',
    sku: 'AV001',
    description: '2 meter HDMI cable',
    costPrice: 120,
    sellingPrice: 200,
    quantity: 75,
    reorderLevel: 15,
    categoryId: 3,
    isActive: true,
    createdAt: new Date('2024-01-03'),
  },
  {
    id: 4,
    name: 'USB-C Connector',
    sku: 'CN001',
    description: 'USB-C to USB-A connector',
    costPrice: 30,
    sellingPrice: 50,
    quantity: 200,
    reorderLevel: 50,
    categoryId: 4,
    isActive: true,
    createdAt: new Date('2024-01-04'),
  },
  {
    id: 5,
    name: 'Cable Ties Pack',
    sku: 'AC001',
    description: 'Pack of 100 cable ties',
    costPrice: 15,
    sellingPrice: 20,
    quantity: 500,
    reorderLevel: 100,
    categoryId: 5,
    isActive: true,
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 6,
    name: 'VGA Cable 1.5m',
    sku: 'AV002',
    description: '1.5 meter VGA cable',
    costPrice: 80,
    sellingPrice: 120,
    quantity: 30,
    reorderLevel: 10,
    categoryId: 3,
    isActive: true,
    createdAt: new Date('2024-01-06'),
  },
  {
    id: 7,
    name: 'RJ45 Connector',
    sku: 'CN002',
    description: 'Ethernet RJ45 connector',
    costPrice: 5,
    sellingPrice: 10,
    quantity: 1000,
    reorderLevel: 200,
    categoryId: 4,
    isActive: true,
    createdAt: new Date('2024-01-07'),
  },
  {
    id: 8,
    name: 'Extension Cord 5m',
    sku: 'PC002',
    description: '5 meter extension cord',
    costPrice: 150,
    sellingPrice: 220,
    quantity: 25,
    reorderLevel: 5,
    categoryId: 1,
    isActive: true,
    createdAt: new Date('2024-01-08'),
  },
  {
    id: 9,
    name: 'Fiber Optic Cable',
    sku: 'NC002',
    description: 'Fiber optic network cable',
    costPrice: 200,
    sellingPrice: 300,
    quantity: 15,
    reorderLevel: 5,
    categoryId: 2,
    isActive: true,
    createdAt: new Date('2024-01-09'),
  },
  {
    id: 10,
    name: 'Cable Organizer Box',
    sku: 'AC002',
    description: 'Cable management box',
    costPrice: 80,
    sellingPrice: 120,
    quantity: 40,
    reorderLevel: 10,
    categoryId: 5,
    isActive: true,
    createdAt: new Date('2024-01-10'),
  },
];

// Seed sample sales
const INITIAL_SALES: Sale[] = [
  {
    id: 1,
    saleNo: 'SALE-20240115-ABC12',
    productId: 1,
    quantity: 5,
    unitPrice: 150,
    totalAmount: 750,
    discount: 0,
    finalAmount: 750,
    customerName: 'John Doe',
    customerPhone: '03001234567',
    saleDate: new Date('2024-01-15'),
  },
  {
    id: 2,
    saleNo: 'SALE-20240116-XYZ34',
    productId: 2,
    quantity: 10,
    unitPrice: 80,
    totalAmount: 800,
    discount: 50,
    finalAmount: 750,
    customerName: 'Jane Smith',
    customerPhone: '03009876543',
    saleDate: new Date('2024-01-16'),
  },
  {
    id: 3,
    saleNo: 'SALE-20240117-DEF56',
    productId: 3,
    quantity: 3,
    unitPrice: 200,
    totalAmount: 600,
    discount: 0,
    finalAmount: 600,
    saleDate: new Date('2024-01-17'),
  },
];

export const useStockStore = create<StockState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  sales: INITIAL_SALES,
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => ({
      products: [...state.products, newProduct],
    }));
  },
  updateProduct: (id, product) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
    }));
  },
  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },
  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
  getLowStockProducts: () => {
    return get().products.filter((p) => p.isActive && p.quantity <= p.reorderLevel);
  },
  recordSale: (sale) => {
    const product = get().getProductById(sale.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.quantity < sale.quantity) {
      throw new Error('Insufficient stock');
    }

    const totalAmount = sale.quantity * sale.unitPrice;
    const finalAmount = calculateFinalAmount(sale.quantity, sale.unitPrice, sale.discount || 0);

    const newSale: Sale = {
      ...sale,
      id: Date.now(),
      saleNo: generateSaleNumber(),
      saleDate: new Date(),
      totalAmount,
      finalAmount,
    };

    // Update product quantity
    get().updateProduct(sale.productId, {
      quantity: product.quantity - sale.quantity,
    });

    set((state) => ({
      sales: [newSale, ...state.sales],
    }));
  },
  getSalesHistory: () => {
    return get().sales;
  },
}));

