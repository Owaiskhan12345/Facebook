import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService, verifyPassword, hashPassword } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  refreshCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize DB and load current session on mount
  useEffect(() => {
    StorageService.initDatabase();
    const sessionUser = StorageService.getCurrentUser();
    if (sessionUser) {
      // Re-verify that user still exists in DB
      const dbUsers = StorageService.getUsers();
      const verified = dbUsers.find(u => u.id === sessionUser.id);
      if (verified) {
        setCurrentUser(verified);
      } else {
        StorageService.setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password' };
    }

    const user = StorageService.getUserByEmail(trimmedEmail);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Wrong password' };
    }

    // Success! Update storage and state
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    return { success: true };
  };

  const register = (
    name: string,
    username: string,
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'Full name is required' };
    }
    if (!trimmedUsername) {
      return { success: false, error: 'Username is required' };
    }
    if (trimmedUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { success: false, error: 'Please provide a valid email address' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check duplicate email
    if (StorageService.getUserByEmail(trimmedEmail)) {
      return { success: false, error: 'This email is already registered. Please log in.' };
    }

    // Check duplicate username
    if (StorageService.getUserByUsername(trimmedUsername)) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }

    // Generate user
    const avatarList = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
    ];
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashPassword(password),
      originalPassword: password, // preserved for demo inspection in Admin settings
      role: 'user',
      avatar: randomAvatar,
      createdAt: new Date().toISOString(),
      bio: 'New member of the Facebook community'
    };

    StorageService.saveUser(newUser);
    return { success: true };
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const refreshCurrentUser = () => {
    if (!currentUser) return;
    const users = StorageService.getUsers();
    const updated = users.find(u => u.id === currentUser.id);
    if (updated) {
      setCurrentUser(updated);
      StorageService.setCurrentUser(updated);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshCurrentUser
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
