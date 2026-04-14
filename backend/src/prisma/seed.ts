import { config } from 'dotenv';
import path from 'path';
// .env is in the project root, one level above the backend folder
config({ path: path.resolve(process.cwd(), '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const videos = [
  {
    title: 'Bubble Sort Explained',
    description: 'Learn how bubble sort works by repeatedly swapping adjacent elements that are in the wrong order. A great starting point for understanding sorting algorithms.',
    url: 'uploads/videos/bubble_sort.mp4',
    thumbnailUrl: '',
    duration: 60,
    subject: 'Computer Science',
    topic: 'Sorting Algorithms',
    difficulty: 'beginner' as const,
    xpReward: 10,
    isPublished: true,
  },
  {
    title: 'Insertion Sort Visualized',
    description: 'Insertion sort builds the sorted array one item at a time. See how it picks each element and inserts it into its correct position.',
    url: 'uploads/videos/insertion_sort.mp4',
    thumbnailUrl: '',
    duration: 60,
    subject: 'Computer Science',
    topic: 'Sorting Algorithms',
    difficulty: 'beginner' as const,
    xpReward: 10,
    isPublished: true,
  },
  {
    title: 'Selection Sort Step by Step',
    description: 'Selection sort finds the minimum element and moves it to the front. Watch how it selects and swaps elements through each pass of the array.',
    url: 'uploads/videos/selection_sort.mp4',
    thumbnailUrl: '',
    duration: 60,
    subject: 'Computer Science',
    topic: 'Sorting Algorithms',
    difficulty: 'beginner' as const,
    xpReward: 10,
    isPublished: true,
  },
  {
    title: 'Merge Sort Deep Dive',
    description: 'Merge sort uses divide and conquer to sort arrays efficiently. Follow the recursive splitting and merging process in this visual walkthrough.',
    url: 'uploads/videos/merge_sort.mp4',
    thumbnailUrl: '',
    duration: 75,
    subject: 'Computer Science',
    topic: 'Sorting Algorithms',
    difficulty: 'intermediate' as const,
    xpReward: 15,
    isPublished: true,
  },
  {
    title: 'Quick Sort in Action',
    description: 'Quick sort is one of the fastest sorting algorithms in practice. See how it picks a pivot and partitions the array around it recursively.',
    url: 'uploads/videos/quick_sort.mp4',
    thumbnailUrl: '',
    duration: 55,
    subject: 'Computer Science',
    topic: 'Sorting Algorithms',
    difficulty: 'intermediate' as const,
    xpReward: 15,
    isPublished: true,
  },
];

async function main() {
  console.log('Seeding videos...');

  // Clear existing videos first to avoid duplicates on re-run
  await prisma.video.deleteMany({});

  const created = await prisma.video.createMany({ data: videos });
  console.log(`  ✓ Created ${created.count} videos`);

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
