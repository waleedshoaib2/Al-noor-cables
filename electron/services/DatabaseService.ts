import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log';

let prisma: PrismaClient;

export class DatabaseService {
  private static instance: DatabaseService;
  private initialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  getPrisma(): PrismaClient {
    return prisma;
  }

  private initializePrisma(): void {
    const dbPath = path.join(app.getPath('userData'), 'app.db');
    // Set environment variable for Prisma
    process.env.DATABASE_URL = `file:${dbPath}`;
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`,
        },
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      log.info('Initializing database...');
      
      // Initialize Prisma client
      this.initializePrisma();
      
      // Run migrations
      await this.runMigrations();
      
      // Seed default data
      await this.seedDefaultData();
      
      this.initialized = true;
      log.info('Database initialized successfully');
    } catch (error) {
      log.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      // Prisma will auto-migrate on first run
      // In production, you'd run migrations explicitly
      await prisma.$connect();
      log.info('Database connection established');
    } catch (error) {
      log.error('Migration failed:', error);
      throw error;
    }
  }

  async seedDefaultData(): Promise<void> {
    try {
      // Check if admin user exists
      const adminExists = await prisma.user.findUnique({
        where: { username: 'admin' },
      });

      if (!adminExists) {
        // Create admin user
        const passwordHash = await bcrypt.hash('admin123', 12);
        await prisma.user.create({
          data: {
            username: 'admin',
            passwordHash,
            fullName: 'Administrator',
            role: 'admin',
            isActive: true,
          },
        });
        log.info('Admin user created');
      }

      // Seed product categories
      const categories = [
        { name: 'Cables-Power', description: 'Power cables and cords' },
        { name: 'Cables-Network', description: 'Network and ethernet cables' },
        { name: 'Cables-Audio/Video', description: 'Audio and video cables' },
        { name: 'Connectors', description: 'Various connectors and adapters' },
        { name: 'Accessories', description: 'Cable accessories and tools' },
      ];

      for (const cat of categories) {
        await prisma.category.upsert({
          where: { name: cat.name },
          update: {},
          create: cat,
        });
      }
      log.info('Product categories seeded');

      // Seed expense categories
      const expenseCategories = [
        { name: 'Utilities', description: 'Electricity, water, internet', color: '#EF4444' },
        { name: 'Rent', description: 'Office and warehouse rent', color: '#3B82F6' },
        { name: 'Salaries', description: 'Employee salaries', color: '#10B981' },
        { name: 'Transportation', description: 'Shipping and delivery', color: '#F59E0B' },
        { name: 'Supplies', description: 'Office and warehouse supplies', color: '#8B5CF6' },
        { name: 'Maintenance', description: 'Equipment and facility maintenance', color: '#EC4899' },
        { name: 'Marketing', description: 'Marketing and advertising', color: '#14B8A6' },
        { name: 'Other', description: 'Miscellaneous expenses', color: '#6B7280' },
      ];

      for (const cat of expenseCategories) {
        await prisma.expenseCategory.upsert({
          where: { name: cat.name },
          update: {},
          create: cat,
        });
      }
      log.info('Expense categories seeded');
    } catch (error) {
      log.error('Seeding failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

