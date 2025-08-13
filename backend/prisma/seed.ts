import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: hashedPassword,
      xp: 150,
      level: 2,
      streak: 5,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      passwordHash: hashedPassword,
      xp: 300,
      level: 3,
      streak: 12,
    },
  });

  // Create sample videos
  const video1 = await prisma.video.create({
    data: {
      title: 'Introduction to Calculus',
      description: 'Learn the basics of differential calculus in under 2 minutes',
      url: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      duration: 120, // 2 minutes
      subject: 'Mathematics',
      topic: 'Calculus',
      difficulty: 'beginner',
      xpReward: 20,
      isPublished: true,
    },
  });

  const video2 = await prisma.video.create({
    data: {
      title: 'Photosynthesis Explained',
      description: 'Understanding how plants convert light into energy',
      url: 'https://example.com/video2.mp4',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      duration: 90, // 1.5 minutes
      subject: 'Biology',
      topic: 'Plant Biology',
      difficulty: 'intermediate',
      xpReward: 15,
      isPublished: true,
    },
  });

  const video3 = await prisma.video.create({
    data: {
      title: 'Newton\'s Laws of Motion',
      description: 'The three fundamental laws that govern motion',
      url: 'https://example.com/video3.mp4',
      thumbnailUrl: 'https://example.com/thumb3.jpg',
      duration: 180, // 3 minutes
      subject: 'Physics',
      topic: 'Mechanics',
      difficulty: 'intermediate',
      xpReward: 25,
      isPublished: true,
    },
  });

  // Create sample quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      videoId: video1.id,
      title: 'Calculus Basics Quiz',
      passingScore: 70,
      questions: {
        create: [
          {
            question: 'What is the derivative of x²?',
            options: ['2x', 'x²', '2', 'x'],
            correctAnswer: 0,
            explanation: 'The power rule states that the derivative of xⁿ is n·x^(n-1)',
            difficulty: 'beginner',
            points: 1,
            order: 1,
          },
          {
            question: 'What does calculus help us understand?',
            options: ['Change and motion', 'Static shapes', 'Number theory', 'Algebra'],
            correctAnswer: 0,
            explanation: 'Calculus is the mathematics of change and motion',
            difficulty: 'beginner',
            points: 1,
            order: 2,
          },
        ],
      },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      videoId: video2.id,
      title: 'Photosynthesis Quiz',
      passingScore: 60,
      questions: {
        create: [
          {
            question: 'What do plants need for photosynthesis?',
            options: ['Water, CO2, and sunlight', 'Only water', 'Only sunlight', 'Only CO2'],
            correctAnswer: 0,
            explanation: 'Plants need carbon dioxide, water, and sunlight to perform photosynthesis',
            difficulty: 'intermediate',
            points: 2,
            order: 1,
          },
          {
            question: 'What is produced during photosynthesis?',
            options: ['Glucose and oxygen', 'Only glucose', 'Only oxygen', 'Water and CO2'],
            correctAnswer: 0,
            explanation: 'Photosynthesis produces glucose (sugar) and oxygen as byproducts',
            difficulty: 'intermediate',
            points: 2,
            order: 2,
          },
        ],
      },
    },
  });

  // Create sample achievements
  await prisma.achievement.createMany({
    data: [
      {
        title: 'First Steps',
        description: 'Complete your first video',
        icon: '🎯',
        xpReward: 10,
        criteria: { type: 'video_completion', count: 1 },
      },
      {
        title: 'Quiz Master',
        description: 'Score 100% on any quiz',
        icon: '🏆',
        xpReward: 25,
        criteria: { type: 'perfect_quiz', count: 1 },
      },
      {
        title: 'Streak Keeper',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        xpReward: 50,
        criteria: { type: 'streak', days: 7 },
      },
      {
        title: 'Knowledge Seeker',
        description: 'Complete 10 videos',
        icon: '📚',
        xpReward: 75,
        criteria: { type: 'video_completion', count: 10 },
      },
    ],
  });

  // Create some sample progress
  await prisma.userProgress.create({
    data: {
      userId: user1.id,
      videoId: video1.id,
      watchTime: 120,
      completed: true,
      quizScore: 85,
      xpEarned: 20,
      completedAt: new Date(),
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: user2.id,
      videoId: video1.id,
      watchTime: 120,
      completed: true,
      quizScore: 100,
      xpEarned: 20,
      completedAt: new Date(),
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: user2.id,
      videoId: video2.id,
      watchTime: 90,
      completed: true,
      quizScore: 75,
      xpEarned: 15,
      completedAt: new Date(),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Created users:', { user1: user1.email, user2: user2.email });
  console.log('Created videos:', video1.title, video2.title, video3.title);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });