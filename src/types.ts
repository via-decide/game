/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserProfile = {
  uid: string;
  username: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  avatarEmoji?: string;
  bio?: string;
  credits: number;
  xp: number;
  level: number;
  followers: number;
  following: number;
  posts: number;
  createdAt: any;
};

export type Post = {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: any;
};

export type DeepDive = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  readTime: number;
  participants: number;
  createdAt: any;
};

export type AppState = {
  activeTab: 'feed' | 'dives' | 'market' | 'profile';
  user: UserProfile | null;
  isAuthReady: boolean;
  posts: Post[];
  deepDives: DeepDive[];
  currentPostIndex: number;
};
