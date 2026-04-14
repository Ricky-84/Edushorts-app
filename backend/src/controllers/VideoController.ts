import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../config/database';

export class VideoController {
  getVideos = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.video.count({ where: { isPublished: true } }),
    ]);

    res.status(200).json({
      videos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  getVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    res.status(200).json({ video });
  });

  streamVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    const filePath = path.resolve(__dirname, '../../', video.url);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Video file not found on server' });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });

  updateProgress = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    res.status(200).json({
      message: 'Update progress endpoint - coming soon',
      videoId: id,
      progress: req.body,
    });
  });

  getQuiz = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    res.status(200).json({
      message: 'Get quiz endpoint - coming soon',
      videoId: id,
      quiz: null,
    });
  });

  submitQuiz = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    res.status(200).json({
      message: 'Submit quiz endpoint - coming soon',
      videoId: id,
      submission: req.body,
      score: 0,
    });
  });
}
