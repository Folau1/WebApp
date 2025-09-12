import { Router } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error';
import { verifyTelegramData } from '../middleware/auth';
import { adminLoginSchema, telegramValidateSchema } from '../schemas/auth';
import { logger } from '../utils/logger';

export const authRouter = Router();

// Admin login
authRouter.post('/admin/login', async (req, res, next) => {
  try {
    const data = adminLoginSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({
      where: { email: data.email }
    });

    if (!admin || !admin.active) {
      throw new AppError(401, 'Invalid credentials');
    }

    const validPassword = await argon2.verify(admin.passwordHash, data.password);
    if (!validPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        type: 'admin'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info({ adminId: admin.id }, 'Admin logged in');

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Validate Telegram WebApp data
authRouter.post('/telegram/validate', async (req, res, next) => {
  try {
    const data = telegramValidateSchema.parse(req.body);

    if (!verifyTelegramData(data.initData)) {
      throw new AppError(401, 'Invalid Telegram data');
    }

    const urlParams = new URLSearchParams(data.initData);
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

      logger.info({ userId: user.id, tgId: user.tgId }, 'New user created');
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});
