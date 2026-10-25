import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Home, Tv, Store, Users, Gamepad2, Menu, MessageCircle, Bell,
  LogOut, Shield, Plus, Image as ImageIcon, Smile, Video, MoreHorizontal,
  ThumbsUp, Heart, MessageSquare, Share2, Send, X, ExternalLink, Bookmark,
  Clock, Flag, ChevronDown, Check, UserPlus, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService, INITIAL_CONTACTS } from '../services/storage';
import { Post, Story, Contact, ReactionType, Comment } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [contacts] = useState<Contact[]>(INITIAL_CONTACTS);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Post creation modal
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<'Public' | 'Friends'>('Public');

  // Interactive comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  // Active hover reaction post ID
  const [hoverReactionPostId, setHoverReactionPostId] = useState<string | null>(null);

  // Profile / Account dropdown
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Floating Chat Box
  const [activeChatContact, setActiveChatContact] = useState<Contact | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'contact'; text: string; time: string }[]>([
    { sender: 'contact', text: 'Hey there! How is your day going?', time: '12:05 PM' }
  ]);
  const [chatInputText, setChatInputText] = useState('');

  // Mobile navigation tab
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'watch' | 'marketplace' | 'groups' | 'gaming'>('home');

  // Load feed on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPosts(StorageService.getPosts());
    setStories(StorageService.getStories());
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostImage.trim()) return;
    if (!currentUser) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      authorRole: currentUser.role,
      content: newPostContent.trim(),
      image: newPostImage.trim() || undefined,
      createdAt: new Date().toISOString(),
      likes: [],
      userReactions: {},
      comments: [],
      sharesCount: 0
    };

    StorageService.createPost(newPost);
    setNewPostContent('');
    setNewPostImage('');
    setCreatePostModalOpen(false);
    loadData();
  };

  const handleReaction = (postId: string, reaction: ReactionType) => {
    if (!currentUser) return;
    StorageService.toggleLikePost(postId, currentUser.id, reaction);
    setHoverReactionPostId(null);
    loadData();
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !currentUser) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: text,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    StorageService.addComment(postId, newComment);
    setCommentInputs({ ...commentInputs, [postId]: '' });
    loadData();
  };

  const handleShare = (postId: string) => {
    StorageService.incrementShare(postId);
    loadData();
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      StorageService.deletePost(postId);
      loadData();
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeChatContact) return;

    const userMsg = chatInputText.trim();
    const newChat = [...chatMessages, { sender: 'user' as const, text: userMsg, time: 'Just now' }];
    setChatMessages(newChat);
    setChatInputText('');

    // Simulate friendly reply
    setTimeout(() => {
      const replies = [
        `Thanks for messaging! Always great to stay connected on Facebook.`,
        `Haha that's awesome! Let's catch up more soon.`,
        `Got it! Let me know if you need anything else.`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages(prev => [...prev, { sender: 'contact', text: randomReply, time: 'Just now' }]);
    }, 1000);
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.authorName.toLowerCase().includes(q) ||
      p.authorUsername.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    );
  });

  const getReactionIcon = (reaction?: ReactionType) => {
    switch (reaction) {
      case 'love':
        return <span className="text-red-500 font-bold flex items-center gap-1.5"><Heart className="w-4 h-4 fill-red-500" /> Love</span>;
      case 'care':
        return <span className="text-amber-500 font-bold flex items-center gap-1.5">🥰 Care</span>;
      case 'haha':
        return <span className="text-amber-500 font-bold flex items-center gap-1.5">😆 Haha</span>;
      case 'wow':
        return <span className="text-amber-500 font-bold flex items-center gap-1.5">😮 Wow</span>;
      case 'sad':
        return <span className="text-amber-500 font-bold flex items-center gap-1.5">😢 Sad</span>;
      case 'angry':
        return <span className="text-orange-600 font-bold flex items-center gap-1.5">😡 Angry</span>;
      case 'like':
      default:
        return <span className="text-[#1877F2] font-bold flex items-center gap-1.5"><ThumbsUp className="w-4 h-4 fill-[#1877F2]" /> Like</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-gray-900 pb-12">
      
      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs h-14 px-3 sm:px-4 flex items-center justify-between">
        
        {/* Left: Facebook Logo & Search Bar */}
        <div className="flex items-center gap-2 max-w-[320px] w-full">
          <Link to="/dashboard" className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-extrabold text-2xl shadow-xs tracking-tighter">
              f
            </div>
          </Link>

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Facebook"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] focus:bg-white text-sm pl-9 pr-3 py-2 rounded-full border border-transparent focus:border-[#1877F2] focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Main Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center justify-center gap-1 h-full max-w-[580px] flex-1 px-4">
          <button
            onClick={() => setActiveNavTab('home')}
            className={`h-full flex items-center justify-center px-6 lg:px-8 relative border-b-4 transition ${
              activeNavTab === 'home'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-lg my-1'
            }`}
            title="Home"
          >
            <Home className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveNavTab('watch')}
            className={`h-full flex items-center justify-center px-6 lg:px-8 relative border-b-4 transition ${
              activeNavTab === 'watch'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-lg my-1'
            }`}
            title="Video"
          >
            <Tv className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveNavTab('marketplace')}
            className={`h-full flex items-center justify-center px-6 lg:px-8 relative border-b-4 transition ${
              activeNavTab === 'marketplace'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-lg my-1'
            }`}
            title="Marketplace"
          >
            <Store className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveNavTab('groups')}
            className={`h-full flex items-center justify-center px-6 lg:px-8 relative border-b-4 transition ${
              activeNavTab === 'groups'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-lg my-1'
            }`}
            title="Groups"
          >
            <Users className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveNavTab('gaming')}
            className={`h-full flex items-center justify-center px-6 lg:px-8 relative border-b-4 transition ${
              activeNavTab === 'gaming'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-lg my-1'
            }`}
            title="Gaming"
          >
            <Gamepad2 className="w-6 h-6" />
          </button>
        </nav>

        {/* Right: Quick Actions & Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Admin badge tag in navbar if admin */}
          {isAdmin && (
            <Link
              to="/settings"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#1877F2] border border-blue-200 text-xs font-bold rounded-full transition shadow-2xs mr-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Panel
            </Link>
          )}

          {/* Action icon buttons */}
          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center text-gray-800 transition cursor-pointer"
            title="Create Post"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveChatContact(contacts[0])}
            className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center text-gray-800 transition cursor-pointer relative"
            title="Messenger"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2">
              2
            </span>
          </button>

          <button
            className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center text-gray-800 transition cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2">
              3
            </span>
          </button>

          {/* User Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-300"
              />
              <span className="hidden xl:inline text-sm font-semibold text-gray-800 pr-1">
                {currentUser?.name?.split(' ')[0]}
              </span>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={currentUser?.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 truncate">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{currentUser?.username}</p>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          currentUser?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {currentUser?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {isAdmin && (
                    <Link
                      to="/settings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] rounded-lg transition"
                    >
                      <Shield className="w-5 h-5 text-[#1877F2]" />
                      <div>
                        <p className="font-semibold">Admin Panel</p>
                        <p className="text-xs text-gray-500">Manage all registered users</p>
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left cursor-pointer"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold">Log Out</p>
                      <p className="text-xs text-gray-500">Sign out of this session</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN 3-COLUMN CONTENT ================= */}
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 pt-4 flex gap-6 justify-between">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="hidden lg:block w-[300px] xl:w-[340px] flex-shrink-0 sticky top-18 h-[calc(100vh-5rem)] overflow-y-auto pr-2 scrollbar-thin">
          <div className="space-y-1">
            {/* User Profile item */}
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-300"
              />
              <div className="truncate">
                <span className="font-semibold text-gray-900 block truncate">{currentUser?.name}</span>
                <span className="text-xs text-gray-500 truncate block">@{currentUser?.username}</span>
              </div>
            </div>

            {/* Standard Nav Links */}
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1877F2]">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">Friends</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1877F2]">
                <Tv className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">Watch</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1877F2]">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">Marketplace</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1877F2]">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">Groups</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">Memories</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200/70 rounded-xl cursor-pointer transition">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Bookmark className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">Saved</span>
            </div>

            {/* SETTINGS LINK - STRICTLY SHOWN ONLY IF ADMIN */}
            {isAdmin && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 p-2.5 bg-blue-50/80 hover:bg-blue-100 rounded-xl border border-blue-200/80 cursor-pointer transition group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1877F2]">Settings (Admin Only)</span>
                    </div>
                    <p className="text-xs text-gray-500">Manage registered users & database</p>
                  </div>
                </Link>
              </div>
            )}

            <div className="pt-4 text-xs text-gray-400 px-2 leading-relaxed">
              Privacy • Terms • Advertising • Ad Choices • Cookies • More • Meta © 2026
            </div>
          </div>
        </aside>

        {/* ================= CENTER FEED ================= */}
        <main className="flex-1 max-w-[680px] mx-auto w-full space-y-4">
          
          {/* STORIES BAR */}
          <div className="relative overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-2.5">
              
              {/* "Create Story" Card */}
              <div
                onClick={() => setCreatePostModalOpen(true)}
                className="w-28 sm:w-32 h-44 sm:h-52 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex-shrink-0 flex flex-col cursor-pointer hover:shadow-md transition group"
              >
                <div className="h-32 sm:h-38 w-full overflow-hidden bg-gray-100">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt="Create Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="relative flex-1 bg-white flex flex-col items-center justify-center pt-3 pb-1">
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center border-2 border-white shadow-sm">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Create story</span>
                </div>
              </div>

              {/* Dummy Stories Cards */}
              {stories.map(story => (
                <div
                  key={story.id}
                  className="w-28 sm:w-32 h-44 sm:h-52 rounded-xl shadow-xs border border-gray-200 overflow-hidden flex-shrink-0 relative cursor-pointer hover:shadow-md group transition"
                >
                  <img
                    src={story.mediaUrl}
                    alt={story.userName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
                  
                  {/* Story Avatar */}
                  <div className="absolute top-2.5 left-2.5">
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#1877F2] shadow-sm"
                    />
                  </div>

                  {/* Story Name */}
                  <span className="absolute bottom-2.5 left-2.5 right-2.5 text-xs font-semibold text-white truncate drop-shadow-md">
                    {story.userName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CREATE POST BOX */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setCreatePostModalOpen(true)}
                className="flex-1 text-left bg-[#f0f2f5] hover:bg-[#e4e6eb] text-gray-500 px-4 py-2.5 rounded-full text-sm sm:text-base font-normal transition cursor-pointer"
              >
                What's on your mind, {currentUser?.name?.split(' ')[0]}?
              </button>
            </div>

            {/* Quick Action buttons */}
            <div className="grid grid-cols-3 gap-1 pt-2.5">
              <button
                type="button"
                onClick={() => setCreatePostModalOpen(true)}
                className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer text-xs sm:text-sm font-semibold"
              >
                <Video className="w-5 h-5 text-red-500" />
                <span className="hidden sm:inline">Live video</span>
                <span className="sm:hidden">Live</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatePostModalOpen(true)}
                className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer text-xs sm:text-sm font-semibold"
              >
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span className="hidden sm:inline">Photo/video</span>
                <span className="sm:hidden">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatePostModalOpen(true)}
                className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer text-xs sm:text-sm font-semibold"
              >
                <Smile className="w-5 h-5 text-amber-500" />
                <span className="hidden sm:inline">Feeling/activity</span>
                <span className="sm:hidden">Feeling</span>
              </button>
            </div>
          </div>

          {/* POSTS FEED */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-8 text-center">
                <Info className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-bold text-gray-700">No posts found</h3>
                <p className="text-sm text-gray-500 mt-1">Try another search or publish your own post!</p>
              </div>
            ) : (
              filteredPosts.map(post => {
                const userReaction = currentUser ? post.userReactions?.[currentUser.id] : undefined;
                const totalReactions = post.likes?.length || 0;
                const isAuthorOrAdmin = currentUser?.id === post.authorId || isAdmin;

                return (
                  <article key={post.id} className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                    
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">
                              {post.authorName}
                            </span>
                            {post.authorRole === 'admin' && (
                              <span className="inline-flex items-center gap-0.5 bg-blue-100 text-[#1877F2] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                <Shield className="w-2.5 h-2.5" /> Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>@{post.authorUsername}</span>
                            <span>•</span>
                            <span>
                              {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Options menu */}
                      {isAuthorOrAdmin && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-gray-100 rounded-full transition"
                          title="Delete Post"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Post Content Text */}
                    <div className="px-4 pb-3">
                      <p className="text-gray-800 text-[15px] whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Image Media */}
                    {post.image && (
                      <div className="w-full max-h-[500px] overflow-hidden bg-gray-100 border-y border-gray-100">
                        <img
                          src={post.image}
                          alt="Post media"
                          className="w-full h-auto object-cover max-h-[500px]"
                        />
                      </div>
                    )}

                    {/* Post Metrics Stats */}
                    <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1 items-center">
                          <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-[10px] text-white">👍</span>
                          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">❤️</span>
                        </div>
                        <span className="ml-1 font-medium">{totalReactions}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                          className="hover:underline cursor-pointer"
                        >
                          {post.comments?.length || 0} comments
                        </button>
                        <span>{post.sharesCount || 0} shares</span>
                      </div>
                    </div>

                    {/* Post Interaction Bar (Like with popup, Comment, Share) */}
                    <div className="px-2 py-1 grid grid-cols-3 gap-1 relative border-b border-gray-100 text-xs sm:text-sm">
                      
                      {/* Like button with hover popup reactions */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoverReactionPostId(post.id)}
                        onMouseLeave={() => setHoverReactionPostId(null)}
                      >
                        {/* Reaction Bar Popup */}
                        {hoverReactionPostId === post.id && (
                          <div className="absolute -top-12 left-0 bg-white rounded-full shadow-xl border border-gray-200 px-2 py-1 flex items-center gap-2 z-30 animate-in fade-in slide-in-from-bottom-2">
                            <button
                              onClick={() => handleReaction(post.id, 'like')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Like"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'love')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Love"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'care')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Care"
                            >
                              🥰
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'haha')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Haha"
                            >
                              😆
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'wow')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Wow"
                            >
                              😮
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'sad')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Sad"
                            >
                              😢
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'angry')}
                              className="text-2xl hover:scale-130 transition duration-150 cursor-pointer"
                              title="Angry"
                            >
                              😡
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleReaction(post.id, userReaction ? userReaction : 'like')}
                          className="w-full flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer font-semibold"
                        >
                          {userReaction ? (
                            getReactionIcon(userReaction)
                          ) : (
                            <>
                              <ThumbsUp className="w-4 h-4" />
                              <span>Like</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Comment button */}
                      <button
                        onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                        className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer font-semibold"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>

                      {/* Share button */}
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer font-semibold"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    <div className="p-4 bg-gray-50/60 space-y-3">
                      {/* Existing comments list */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2.5">
                          {post.comments.map(c => (
                            <div key={c.id} className="flex items-start gap-2.5">
                              <img
                                src={c.authorAvatar}
                                alt={c.authorName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="bg-[#f0f2f5] rounded-2xl px-3.5 py-2 inline-block max-w-[90%]">
                                  <span className="font-bold text-xs text-gray-900 block">
                                    {c.authorName}
                                  </span>
                                  <span className="text-sm text-gray-800 break-words">
                                    {c.content}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-gray-500 ml-3.5 mt-0.5">
                                  <button className="font-semibold hover:underline cursor-pointer">Like</button>
                                  <button className="font-semibold hover:underline cursor-pointer">Reply</button>
                                  <span>
                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment input */}
                      <div className="flex items-center gap-2 pt-1">
                        <img
                          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={currentUser?.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] focus:bg-white text-sm pl-3.5 pr-10 py-2 rounded-full border border-transparent focus:border-[#1877F2] focus:outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className="absolute right-2 text-[#1877F2] hover:text-blue-700 disabled:opacity-30 cursor-pointer p-1"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="hidden xl:block w-[320px] flex-shrink-0 sticky top-18 h-[calc(100vh-5rem)] overflow-y-auto pl-2 scrollbar-thin">
          <div className="space-y-4">
            
            {/* Sponsored / Ads Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Sponsored</h4>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80"
                  alt="Tech Ad"
                  className="w-24 h-20 rounded-lg object-cover"
                />
                <div className="text-xs">
                  <p className="font-semibold text-gray-900 line-clamp-2">Next-Gen Cloud Solutions</p>
                  <p className="text-gray-500 mt-1">cloudtech.example.com</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Birthdays Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Birthdays</h4>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition text-xs">
                <span className="text-xl">🎁</span>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Sarah Connor</strong> and <strong>2 others</strong> have birthdays today.
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Contacts List with active presence */}
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <h4 className="text-sm font-semibold text-gray-500">Contacts</h4>
                <div className="flex items-center gap-2 text-gray-500">
                  <Search className="w-3.5 h-3.5 cursor-pointer hover:text-gray-700" />
                  <MoreHorizontal className="w-3.5 h-3.5 cursor-pointer hover:text-gray-700" />
                </div>
              </div>

              <div className="space-y-1">
                {contacts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatContact(c)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-200/70 rounded-xl cursor-pointer transition"
                  >
                    <div className="relative">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      />
                      {c.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <span className="text-sm font-medium text-gray-800 block truncate">{c.name}</span>
                      <span className="text-[11px] text-gray-500 block truncate">{c.statusText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= CREATE POST MODAL ================= */}
      {createPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between relative">
              <h3 className="text-lg font-bold text-gray-800 text-center w-full">Create post</h3>
              <button
                onClick={() => setCreatePostModalOpen(false)}
                className="absolute right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreatePost} className="p-4 space-y-4">
              
              {/* User info & Audience */}
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser?.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <span className="font-bold text-gray-900 block text-sm">{currentUser?.name}</span>
                  <select
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value as any)}
                    className="mt-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-md border border-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Public">🌐 Public</option>
                    <option value="Friends">👥 Friends</option>
                  </select>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  rows={4}
                  required={!newPostImage}
                  placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0]}?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full text-base sm:text-lg placeholder:text-gray-400 border-none focus:outline-none resize-none"
                />
              </div>

              {/* Optional Image URL Input */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-green-600" /> Attach Image URL (Optional)
                  </label>
                  {newPostImage && (
                    <button
                      type="button"
                      onClick={() => setNewPostImage('')}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                />
                {newPostImage && (
                  <div className="mt-2 h-36 rounded-md overflow-hidden bg-gray-200">
                    <img src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Quick suggestion samples */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostImage('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80')}
                  className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  🏖️ Add Beach Photo
                </button>
                <button
                  type="button"
                  onClick={() => setNewPostImage('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80')}
                  className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  💼 Add Tech Photo
                </button>
              </div>

              {/* Submit Post Button */}
              <button
                type="submit"
                disabled={!newPostContent.trim() && !newPostImage.trim()}
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] active:bg-[#1465d2] text-white font-bold py-2.5 rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= FLOATING MESSENGER CHAT BOX ================= */}
      {activeChatContact && (
        <div className="fixed bottom-0 right-4 sm:right-10 w-80 sm:w-88 bg-white rounded-t-xl shadow-2xl border border-gray-300 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={activeChatContact.avatar}
                  alt={activeChatContact.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                {activeChatContact.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">{activeChatContact.name}</p>
                <p className="text-[10px] text-gray-500">{activeChatContact.statusText}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-500">
              <button
                onClick={() => setActiveChatContact(null)}
                className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-[#f9fafb] text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-[#1877F2] text-white rounded-br-xs'
                      : 'bg-gray-200 text-gray-900 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} className="p-2 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Aa"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              className="flex-1 bg-gray-100 hover:bg-gray-200/80 focus:bg-white text-xs px-3 py-2 rounded-full border border-transparent focus:border-[#1877F2] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!chatInputText.trim()}
              className="text-[#1877F2] hover:text-blue-700 disabled:opacity-30 p-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-3 z-40 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveNavTab('home')}
          className={`flex flex-col items-center gap-1 ${activeNavTab === 'home' ? 'text-[#1877F2]' : 'text-gray-500'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => setActiveNavTab('watch')}
          className={`flex flex-col items-center gap-1 ${activeNavTab === 'watch' ? 'text-[#1877F2]' : 'text-gray-500'}`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Video</span>
        </button>

        <button
          onClick={() => setCreatePostModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[#1877F2]"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold">Post</span>
        </button>

        <button
          onClick={() => setActiveNavTab('groups')}
          className={`flex flex-col items-center gap-1 ${activeNavTab === 'groups' ? 'text-[#1877F2]' : 'text-gray-500'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Groups</span>
        </button>

        {isAdmin ? (
          <Link
            to="/settings"
            className="flex flex-col items-center gap-1 text-purple-600"
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Admin</span>
          </Link>
        ) : (
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Menu</span>
          </button>
        )}
      </div>
    </div>
  );
};
