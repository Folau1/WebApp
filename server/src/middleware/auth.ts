import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from './error';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'USER' | 'ADMIN';
  };
  admin?: {
    id: string;
    email: string;
  };
}

// Verify JWT token for admin panel
export const verifyAdminToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      type: string;
    };

    if (decoded.type !== 'admin') {
      throw new AppError(403, 'Invalid token type');
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id }
    });

    if (!admin || !admin.active) {
      throw new AppError(401, 'Invalid token');
    }

    req.admin = {
      id: admin.id,
      email: admin.email
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid token'));
    }
  }
};

// Verify Telegram WebApp initData
export const verifyTelegramData = (initData: string): boolean => {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN!)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
};

// Middleware to verify Telegram user
export const verifyTelegramUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      throw new AppError(401, 'No Telegram data provided');
    }

    if (!verifyTelegramData(initData)) {
      throw new AppError(401, 'Invalid Telegram data');
    }

    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      throw new AppError(401, 'No user data in init data');
    }

    const tgUser = JSON.parse(userStr);
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { tgId: tgUser.id.toString() }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          tgId: tgUser.id.toString(),
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username
        }
      });
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Authentication failed'));
    }
  }
};

// Optional Telegram auth - doesn't fail if no data provided
export const optionalTelegramAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (initData && verifyTelegramData(initData)) {
      const urlParams = new URLSearchParams(initData);
      const userStr = urlParams.get('user');
      
      if (userStr) {
        const tgUser = JSON.parse(userStr);
        
        const user = await prisma.user.findUnique({
          where: { tgId: tgUser.id.toString() }
        });

        if (user) {
          req.user = {
            id: user.id,
            role: user.role
          };
        }
      }
    }
  } catch (error) {
    // Ignore errors in optional auth
  }

  next();
};

