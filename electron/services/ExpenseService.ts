import { PrismaClient } from '@prisma/client';
import log from 'electron-log';
import type {
  ExpenseWithUser,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseFilters,
  ExpenseStats,
} from '../../src/types';

export class ExpenseService {
  constructor(private prisma: PrismaClient) {}

  async getAllExpenses(filters?: ExpenseFilters): Promise<ExpenseWithUser[]> {
    try {
      const where: any = {};

      if (filters?.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.date.lte = filters.endDate;
        }
      }

      const expenses = await this.prisma.expense.findMany({
        where,
        include: {
          category: true,
          user: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
      return expenses as ExpenseWithUser[];
    } catch (error) {
      log.error('Get all expenses error:', error);
      throw error;
    }
  }

  async createExpense(data: CreateExpenseData): Promise<ExpenseWithUser> {
    try {
      const expense = await this.prisma.expense.create({
        data: {
          title: data.title,
          description: data.description,
          amount: data.amount,
          categoryId: data.categoryId,
          userId: data.userId,
          date: data.date,
        },
        include: {
          category: true,
          user: true,
        },
      });
      log.info(`Expense created: ${expense.title}`);
      return expense as ExpenseWithUser;
    } catch (error) {
      log.error('Create expense error:', error);
      throw error;
    }
  }

  async updateExpense(data: UpdateExpenseData): Promise<ExpenseWithUser> {
    try {
      const { id, ...updateData } = data;
      const expense = await this.prisma.expense.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          user: true,
        },
      });
      log.info(`Expense updated: ${expense.title}`);
      return expense as ExpenseWithUser;
    } catch (error) {
      log.error('Update expense error:', error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<void> {
    try {
      await this.prisma.expense.delete({
        where: { id },
      });
      log.info(`Expense deleted: ${id}`);
    } catch (error) {
      log.error('Delete expense error:', error);
      throw error;
    }
  }

  async getExpenseStats(startDate?: Date, endDate?: Date): Promise<ExpenseStats> {
    try {
      const where: any = {};
      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = startDate;
        }
        if (endDate) {
          where.date.lte = endDate;
        }
      }

      const expenses = await this.prisma.expense.findMany({
        where,
        include: {
          category: true,
        },
      });

      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      // Group by category
      const categoryMap = new Map<number, { name: string; color: string | null; total: number }>();
      
      expenses.forEach((exp) => {
        const catId = exp.categoryId;
        const existing = categoryMap.get(catId) || {
          name: exp.category.name,
          color: exp.category.color,
          total: 0,
        };
        existing.total += exp.amount;
        categoryMap.set(catId, existing);
      });

      const byCategory = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        categoryColor: data.color,
        total: data.total,
      }));

      return {
        total,
        byCategory,
      };
    } catch (error) {
      log.error('Get expense stats error:', error);
      throw error;
    }
  }
}

