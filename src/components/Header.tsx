import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { useAuth } from '../context/AuthContext';
import { promptStore } from '../services/promptStore';
import { useLogo } from '../context/LogoContext';
import {
  Search,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  Layers,
  LogIn,
  User as UserIcon,
  Heart,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onNavigateHome: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenAdminDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onNavigateHome,
  onOpenLogin,
  onOpenProfile,
  onOpenAdminDashboard,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const fc = promptStore.getFeatureControls();
  const { logoUrl } = useLogo();

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 ${
          isScrolled
            ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm'
            : 'bg-white dark:bg-zinc-950 border-b border-zinc-200/40 dark:border-zinc-800/40'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* 1. Logo & Website Name */}
            <div
              className="flex items-center gap-3 cursor-pointer group shrink-0"
              onClick={onNavigateHome}
            >
              <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden p-0.5">
                {logoUrl ? (
                  <img src={logoUrl} alt="Website Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Sparkles className="w-5 sm:w-6 h-5 sm:h-6" />
                )}
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white font-sans">
                  Sahil Edits
                </span>
              </div>
            </div>

            {/* 2. Search Bar */}
            {fc.searchBar && (
              <div className="flex-1 max-w-md mx-2 sm:mx-4 relative">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search prompts..."
                    className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-200 dark:bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Controls: Dark Mode Toggle, Profile Avatar / Hamburger Menu (☰) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Dark Mode Toggle */}
              {fc.darkMode && (
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Hamburger Menu Button (☰) with User Profile Icon indicator */}
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open Navigation Menu"
                className="p-2 sm:p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                {currentUser ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : null}
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Slide-over Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-full max-w-sm h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-6"
            >
              <div className="space-y-6">
                {/* Header inside Menu */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-lg text-zinc-900 dark:text-white">
                      Navigation Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* USER AUTH SECTION inside Hamburger Menu */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                    Account & Access
                  </span>

                  {!currentUser ? (
                    /* Login Option */
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogIn className="w-4 h-4" />
                        <span>Login / Sign In</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-200" />
                    </button>
                  ) : (
                    /* Logged In User Options */
                    <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                            {currentUser.displayName || currentUser.email?.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1 text-xs">
                        {/* Admin Dashboard Option */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onOpenAdminDashboard();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-sm"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </button>
                        )}

                        {/* My Profile */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-semibold transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-blue-500" />
                          <span>My Profile</span>
                        </button>

                        {/* My Favorites */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-semibold transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>My Favorites</span>
                        </button>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* All Prompts Button */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                    Categories
                  </span>

                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      onSearchChange('');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                      selectedCategory === null && !searchQuery
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>✨ All Prompts</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                      Latest
                    </span>
                  </button>

                  {/* Categories List */}
                  <div className="space-y-1.5 pt-1">
                    {categories
                      .filter((cat) => {
                        const idLower = cat.id.toLowerCase();
                        const nameLower = cat.name.toLowerCase();
                        return (
                          idLower === 'chatgpt' ||
                          idLower === 'gemini' ||
                          idLower === 'image-prompt' ||
                          idLower === 'video-prompt' ||
                          nameLower.includes('chatgpt') ||
                          nameLower.includes('gemini') ||
                          nameLower.includes('image') ||
                          nameLower.includes('video')
                        );
                      })
                      .map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onSelectCategory(cat.id);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left ${
                              isSelected
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <CategoryIcon name={cat.icon} className="w-4 h-4 text-blue-500" />
                              <span>{cat.name}</span>
                            </div>
                            {cat.count !== undefined && (
                              <span className="text-xs text-zinc-400">
                                {cat.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center text-[11px] text-zinc-400 font-medium">
                  © 2026 Sahil Edits. All Rights Reserved.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
