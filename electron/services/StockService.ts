import { PrismaClient } from '@prisma/client';
import log from 'electron-log';
import type {
  ProductWithCategory,
  CreateProductData,
  UpdateProductData,
  CreateSaleData,
  SaleWithProduct,
  SaleFilters,
} from '../../src/types';

// Generate sale number: SALE-YYYYMMDD-XXXXX
function generateSaleNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SALE-${dateStr}-${randomStr}`;
}

export class StockService {
  constructor(private prisma: PrismaClient) {}

  async getAllProducts(): Promise<ProductWithCategory[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return products as ProductWithCategory[];
    } catch (error) {
      log.error('Get all products error:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<ProductWithCategory | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });
      return product as ProductWithCategory | null;
    } catch (error) {
      log.error('Get product by id error:', error);
      throw error;
    }
  }

  async createProduct(data: CreateProductData): Promise<ProductWithCategory> {
    try {
      // Check if SKU already exists
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        throw new Error('SKU already exists');
      }

      // Check if name already exists
      const existingName = await this.prisma.product.findUnique({
        where: { name: data.name },
      });
      if (existingName) {
        throw new Error('Product name already exists');
      }

      const product = await this.prisma.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          description: data.description,
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          quantity: data.quantity,
          reorderLevel: data.reorderLevel,
          categoryId: data.categoryId,
          isActive: true,
          isDeleted: false,
        },
        include: {
          category: true,
        },
      });
      log.info(`Product created: ${product.name}`);
      return product as ProductWithCategory;
    } catch (error) {
      log.error('Create product error:', error);
      throw error;
    }
  }

  async updateProduct(data: UpdateProductData): Promise<ProductWithCategory> {
    try {
      const { id, ...updateData } = data;

      // Check SKU uniqueness if updating
      if (updateData.sku) {
        const existing = await this.prisma.product.findFirst({
          where: {
            sku: updateData.sku,
            id: { not: id },
          },
        });
        if (existing) {
          throw new Error('SKU already exists');
        }
      }

      // Check name uniqueness if updating
      if (updateData.name) {
        const existing = await this.prisma.product.findFirst({
          where: {
            name: updateData.name,
            id: { not: id },
          },
        });
        if (existing) {
          throw new Error('Product name already exists');
        }
      }

      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      });
      log.info(`Product updated: ${product.name}`);
      return product as ProductWithCategory;
    } catch (error) {
      log.error('Update product error:', error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      // Soft delete
      await this.prisma.product.update({
        where: { id },
        data: { isDeleted: true },
      });
      log.info(`Product deleted (soft): ${id}`);
    } catch (error) {
      log.error('Delete product error:', error);
      throw error;
    }
  }

  async getLowStockAlerts(): Promise<ProductWithCategory[]> {
    try {
      // Get all active products and filter in memory
      // Prisma doesn't support comparing two fields directly in SQLite
      const products = await this.prisma.product.findMany({
        where: {
          isDeleted: false,
          isActive: true,
        },
        include: {
          category: true,
        },
      });

      // Filter products where quantity <= reorderLevel
      const lowStockProducts = products.filter(
        (p) => p.quantity <= p.reorderLevel
      ) as ProductWithCategory[];

      return lowStockProducts.sort((a, b) => a.quantity - b.quantity);
    } catch (error) {
      log.error('Get low stock alerts error:', error);
      throw error;
    }
  }

  async recordSale(data: CreateSaleData): Promise<SaleWithProduct> {
    try {
      // Get product and check quantity
      const product = await this.prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.quantity < data.quantity) {
        throw new Error('Insufficient stock');
      }

      // Calculate amounts
      const totalAmount = data.quantity * data.unitPrice;
      const discount = data.discount || 0;
      const finalAmount = totalAmount - discount;

      // Create sale record
      const sale = await this.prisma.sale.create({
        data: {
          saleNo: generateSaleNumber(),
          productId: data.productId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalAmount,
          discount,
          finalAmount,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          notes: data.notes,
        },
        include: {
          product: true,
        },
      });

      // Update product quantity
      await this.prisma.product.update({
        where: { id: data.productId },
        data: {
          quantity: {
            decrement: data.quantity,
          },
        },
      });

      log.info(`Sale recorded: ${sale.saleNo}`);
      return sale as SaleWithProduct;
    } catch (error) {
      log.error('Record sale error:', error);
      throw error;
    }
  }

  async getSales(filters?: SaleFilters): Promise<SaleWithProduct[]> {
    try {
      const where: any = {};

      if (filters?.productId) {
        where.productId = filters.productId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.saleDate = {};
        if (filters.startDate) {
          where.saleDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.saleDate.lte = filters.endDate;
        }
      }

      const sales = await this.prisma.sale.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: {
          saleDate: 'desc',
        },
      });
      return sales as SaleWithProduct[];
    } catch (error) {
      log.error('Get sales error:', error);
      throw error;
    }
  }
}

