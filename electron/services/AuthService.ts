import bcrypt from 'bcryptjs';
import { PrismaClient, User } from '@prisma/client';
import log from 'electron-log';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user || !user.isActive) {
        log.warn(`Login attempt failed for user: ${username}`);
        return null;
      }

      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        log.warn(`Invalid password for user: ${username}`);
        return null;
      }

      log.info(`User logged in: ${username}`);
      return user;
    } catch (error) {
      log.error('Login error:', error);
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createUser(data: {
    username: string;
    password: string;
    fullName?: string;
    role?: string;
  }): Promise<User> {
    try {
      const passwordHash = await this.hashPassword(data.password);
      const user = await this.prisma.user.create({
        data: {
          username: data.username,
          passwordHash,
          fullName: data.fullName,
          role: data.role || 'user',
          isActive: true,
        },
      });
      log.info(`User created: ${data.username}`);
      return user;
    } catch (error) {
      log.error('Create user error:', error);
      throw error;
    }
  }

  async getCurrentUser(userId: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      log.error('Get current user error:', error);
      return null;
    }
  }
}

