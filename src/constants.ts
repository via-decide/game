import { Post, DeepDive } from './types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'system',
    authorName: 'VIA Official',
    authorAvatar: '🇮🇳',
    content: 'Welcome to VIA - Bharat\'s own social platform. Discover stories that matter to you.',
    imageUrl: 'https://picsum.photos/seed/via1/800/1200',
    likes: 1240,
    comments: 85,
    shares: 420,
    createdAt: new Date().toISOString()
  },
  {
    id: 'post-2',
    userId: 'system',
    authorName: 'Tech Bharat',
    authorAvatar: '🚀',
    content: 'The future of digital India is here. Swipe to explore the latest innovations from our local creators.',
    imageUrl: 'https://picsum.photos/seed/via2/800/1200',
    likes: 850,
    comments: 42,
    shares: 150,
    createdAt: new Date().toISOString()
  },
  {
    id: 'post-3',
    userId: 'system',
    authorName: 'Culture Hub',
    authorAvatar: '🎨',
    content: 'Celebrating the vibrant colors and traditions of our diverse heritage. What\'s your favorite festival?',
    imageUrl: 'https://picsum.photos/seed/via3/800/1200',
    likes: 2100,
    comments: 310,
    shares: 890,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_DEEP_DIVES: DeepDive[] = [
  {
    id: 'dive-1',
    title: 'The Rise of Digital Bharat',
    subtitle: 'How connectivity is changing lives in rural India.',
    summary: 'A deep look into the impact of affordable internet on education, healthcare, and entrepreneurship in small villages.',
    content: 'Full story content about digital transformation in rural areas...',
    imageUrl: 'https://picsum.photos/seed/dive1/1200/800',
    category: 'Technology',
    readTime: 8,
    participants: 1240,
    createdAt: new Date().toISOString()
  },
  {
    id: 'dive-2',
    title: 'Sustainable Farming 2.0',
    subtitle: 'Modern tech meets ancient wisdom.',
    summary: 'Exploring how young farmers are using AI and IoT to optimize crop yields while preserving traditional organic methods.',
    content: 'Full story content about modern agriculture...',
    imageUrl: 'https://picsum.photos/seed/dive2/1200/800',
    category: 'Agriculture',
    readTime: 12,
    participants: 850,
    createdAt: new Date().toISOString()
  }
];
