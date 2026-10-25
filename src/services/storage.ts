import bcrypt from 'bcryptjs';
import { User, Post, Story, Contact, Comment, ReactionType } from '../types';

const USERS_STORAGE_KEY = 'fb_users_db';
const POSTS_STORAGE_KEY = 'fb_posts_db';
const SESSION_STORAGE_KEY = 'fb_current_session_user';
const STORIES_STORAGE_KEY = 'fb_stories_db';

// Helper to hash password synchronously
export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Helper to verify password
export const verifyPassword = (password: string, hash: string): boolean => {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return password === hash; // fallback safety
  }
};

// Pre-seeded Initial Users
const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_01',
    name: 'Owais Khan',
    username: 'owais_admin',
    email: 'owaiskhanmmd1@gmail.com',
    password: hashPassword('Owe@1122'),
    originalPassword: 'Owe@1122',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-20T10:00:00.000Z',
    bio: 'Software Architect & System Admin for Facebook'
  },
  {
    id: 'user_test_02',
    name: 'Test User',
    username: 'testuser',
    email: 'test@gmail.com',
    password: hashPassword('123456'),
    originalPassword: '123456',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-22T14:30:00.000Z',
    bio: 'Exploring and connecting on Facebook!'
  },
  {
    id: 'user_zuck_03',
    name: 'Mark Zuckerberg',
    username: 'zuck',
    email: 'zuck@facebook.com',
    password: hashPassword('Meta2026!'),
    originalPassword: 'Meta2026!',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-01T08:00:00.000Z',
    bio: 'Founder at Facebook'
  },
  {
    id: 'user_sarah_04',
    name: 'Sarah Connor',
    username: 'sarah_c',
    email: 'sarah@gmail.com',
    password: hashPassword('SarahPass99'),
    originalPassword: 'SarahPass99',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-23T09:15:00.000Z',
    bio: 'Digital nomad & travel photographer'
  },
  {
    id: 'user_alex_05',
    name: 'Alex Rivera',
    username: 'alex_r',
    email: 'alex@tech.io',
    password: hashPassword('AlexTech88'),
    originalPassword: 'AlexTech88',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-24T16:45:00.000Z',
    bio: 'Frontend enthusiast & open source contributor'
  }
];

// Initial Posts
const INITIAL_POSTS: Post[] = [
  {
    id: 'post_01',
    authorId: 'user_admin_01',
    authorName: 'Owais Khan',
    authorUsername: 'owais_admin',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    authorRole: 'admin',
    content: "🚀 Welcome to the new Facebook application! Everything is built with real authentication, admin role management, interactive posts, dynamic likes, and comments. Check out the Admin Settings panel if you have admin privileges!",
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    likes: ['user_test_02', 'user_zuck_03', 'user_sarah_04'],
    userReactions: {
      user_test_02: 'love',
      user_zuck_03: 'like',
      user_sarah_04: 'care'
    },
    comments: [
      {
        id: 'comment_01',
        authorId: 'user_sarah_04',
        authorName: 'Sarah Connor',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'This interface looks remarkably close to Facebook! Love the clean design and responsiveness.',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        likes: 4
      },
      {
        id: 'comment_02',
        authorId: 'user_test_02',
        authorName: 'Test User',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        content: 'Testing out the comment section from the test user account. Smooth and fast!',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        likes: 2
      }
    ],
    sharesCount: 14
  },
  {
    id: 'post_02',
    authorId: 'user_zuck_03',
    authorName: 'Mark Zuckerberg',
    authorUsername: 'zuck',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorRole: 'admin',
    content: "Connecting people has always been our core vision. Excited to see this modern web stack in action with high performance, smooth animations, and rich interactive features. Drop your thoughts below!",
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes: ['user_admin_01', 'user_alex_05'],
    userReactions: {
      user_admin_01: 'like',
      user_alex_05: 'wow'
    },
    comments: [
      {
        id: 'comment_03',
        authorId: 'user_alex_05',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        content: 'The reaction animations and instant live updates feel so good.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        likes: 5
      }
    ],
    sharesCount: 38
  },
  {
    id: 'post_03',
    authorId: 'user_sarah_04',
    authorName: 'Sarah Connor',
    authorUsername: 'sarah_c',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    authorRole: 'user',
    content: "Golden hour in the mountains 🏔️🌅 Taking a moment away from screens to reconnect with nature. Where is your favorite getaway spot?",
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    likes: ['user_admin_01', 'user_test_02'],
    userReactions: {
      user_admin_01: 'love',
      user_test_02: 'like'
    },
    comments: [],
    sharesCount: 9
  }
];

// Initial Stories
const INITIAL_STORIES: Story[] = [
  {
    id: 'story_01',
    userId: 'user_admin_01',
    userName: 'Owais Khan',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    isCurrentUser: true
  },
  {
    id: 'story_02',
    userId: 'user_sarah_04',
    userName: 'Sarah Connor',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'story_03',
    userId: 'user_zuck_03',
    userName: 'Mark Zuckerberg',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'story_04',
    userId: 'user_alex_05',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80'
  }
];

// Initial Contacts
export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'user_admin_01',
    name: 'Owais Khan',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    statusText: 'Admin Active'
  },
  {
    id: 'user_zuck_03',
    name: 'Mark Zuckerberg',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    statusText: 'Active now'
  },
  {
    id: 'user_sarah_04',
    name: 'Sarah Connor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    statusText: 'Active 5m ago'
  },
  {
    id: 'user_alex_05',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    statusText: 'Active 2h ago'
  },
  {
    id: 'contact_06',
    name: 'Emma Watson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    statusText: 'Active now'
  },
  {
    id: 'contact_07',
    name: 'David Beckham',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    statusText: 'Active yesterday'
  }
];

export const StorageService = {
  // Initialize Database
  initDatabase(): void {
    const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!existingUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    } else {
      // Ensure the mandated Admin user is always present
      try {
        const users: User[] = JSON.parse(existingUsers);
        const hasAdmin = users.some(u => u.email.toLowerCase() === 'owaiskhanmmd1@gmail.com');
        if (!hasAdmin) {
          users.unshift(INITIAL_USERS[0]);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        const hasTestUser = users.some(u => u.email.toLowerCase() === 'test@gmail.com');
        if (!hasTestUser) {
          users.push(INITIAL_USERS[1]);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      } catch (e) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      }
    }

    if (!localStorage.getItem(POSTS_STORAGE_KEY)) {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    }

    if (!localStorage.getItem(STORIES_STORAGE_KEY)) {
      localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(INITIAL_STORIES));
    }
  },

  // Users Management
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  getUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  },

  getUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.username.toLowerCase().trim() === username.toLowerCase().trim());
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.unshift(user);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const targetUser = users.find(u => u.id === userId);
    
    // Safety check: Cannot delete system admin 'owaiskhanmmd1@gmail.com'
    if (targetUser && targetUser.email.toLowerCase() === 'owaiskhanmmd1@gmail.com') {
      return false;
    }

    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  updateUserRole(userId: string, role: 'admin' | 'user'): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    
    // Protection: Main system admin cannot be demoted
    if (user.email.toLowerCase() === 'owaiskhanmmd1@gmail.com' && role !== 'admin') {
      return false;
    }

    user.role = role;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  },

  // Active Session
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  // Posts Management
  getPosts(): Post[] {
    try {
      const data = localStorage.getItem(POSTS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  },

  createPost(newPost: Post): void {
    const posts = this.getPosts();
    posts.unshift(newPost);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  },

  deletePost(postId: string): void {
    const posts = this.getPosts().filter(p => p.id !== postId);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  },

  toggleLikePost(postId: string, userId: string, reaction: ReactionType = 'like'): void {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.likes) post.likes = [];
    if (!post.userReactions) post.userReactions = {};

    const hasLiked = post.likes.includes(userId);
    const currentReaction = post.userReactions[userId];

    if (hasLiked && currentReaction === reaction) {
      // Remove like
      post.likes = post.likes.filter(id => id !== userId);
      delete post.userReactions[userId];
    } else {
      // Add or change reaction
      if (!hasLiked) {
        post.likes.push(userId);
      }
      post.userReactions[userId] = reaction;
    }

    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  },

  addComment(postId: string, comment: Comment): void {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  },

  incrementShare(postId: string): void {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.sharesCount = (post.sharesCount || 0) + 1;
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  },

  // Stories Management
  getStories(): Story[] {
    try {
      const data = localStorage.getItem(STORIES_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  },

  // Reset to default factory state
  resetData(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(POSTS_STORAGE_KEY);
    localStorage.removeItem(STORIES_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.initDatabase();
  }
};
