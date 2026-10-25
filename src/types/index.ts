export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string; // Hashed with bcryptjs
  originalPassword?: string; // Stored for the required admin demo "Show Original" eye feature
  role: UserRole;
  avatar?: string;
  createdAt: string;
  bio?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[]; // array of userIds
  userReactions: Record<string, ReactionType>;
  comments: Comment[];
  sharesCount: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  isCurrentUser?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  statusText?: string;
}
