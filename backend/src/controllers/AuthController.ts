import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createAppError('User with this email already exists', 400);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createAppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw createAppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
      token,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      message: 'Logout successful',
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      message: 'Refresh token endpoint - coming soon',
    });
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw createAppError('User not found', 404);
    }

    // Fetch complete user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        streak: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw createAppError('User not found', 404);
    }

    res.status(200).json({
      message: 'User data retrieved successfully',
      user,
    });
  });
}