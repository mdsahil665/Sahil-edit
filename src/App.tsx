import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogoProvider } from './context/LogoContext';
import { Header } from './components/Header';
import { PromptCard } from './components/PromptCard';
import { PromptModal } from './components/PromptModal';
import { Footer } from './components/Footer';
import { PageModal } from './components/PageModal';
import { AdBanner } from './components/AdBanner';
import { LoginModal } from './components/LoginModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PostFormModal } from './components/admin/PostFormModal';
import { CategoryFormModal } from './components/admin/CategoryFormModal';
import { promptStore } from './services/promptStore';
import { PromptPost, Category, CustomPage } from './types';
import {
  SearchX,
  X,
  ChevronDown,
  ArrowUp,
  Wrench,
  Sparkles,
  Copy,
  Check,
  Zap,
  Flame,
  Compass,
  ArrowRight,
  ShieldCheck,
  Eye,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentUser, isAdmin } = useAuth();
  const [posts, setPosts] = useState<PromptPost[]>(() => promptStore.getPosts());
  const [categories, setCategories] = useState<Category[]>(() => promptStore.getCategories());
  const [featureControls, setFeatureControls] = useState(() => promptStore.getFeatureControls());
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Infinite Scroll limit state
  const [visibleCount, setVisibleCount] = useState(6);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Back to Top button state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Modals
  const [activePromptModal, setActivePromptModal] = useState<PromptPost | null>(null);
  const [activePageModal, setActivePageModal] = useState<CustomPage | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingPostModal, setEditingPostModal] = useState<PromptPost | null | 'new'>(null);
  const [editingCategoryModal, setEditingCategoryModal] = useState<Category | null | 'new'>(null);

  const { showToast } = useToast();

  const monetizationSettings = promptStore.getMonetization();

  // Sync state with promptStore events (Firestore real-time)
  useEffect(() => {
    const unsubscribe = promptStore.subscribe(() => {
      setPosts(promptStore.getPosts());
      setCategories(promptStore.getCategories());
      setFeatureControls(promptStore.getFeatureControls());
    });
    return unsubscribe;
  }, []);

  // Back to Top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected Admin Route Check (?admin, #admin, /admin, Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminUrl = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (search.includes('admin') || hash.includes('admin') || path.includes('/admin')) {
        if (isAdmin) {
          setShowAdminDashboard(true);
        } else {
          setShowLoginModal(true);
          showToast('Admin Authentication Required', 'Please log in with an Admin account.', 'error');
        }
      }
    };

    checkAdminUrl();
    window.addEventListener('popstate', checkAdminUrl);
    window.addEventListener('hashchange', checkAdminUrl);

    // Keyboard shortcut (Ctrl+Shift+A / Cmd+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdmin) {
          setShowAdminDashboard(true);
        } else {
          setShowLoginModal(true);
          showToast('Admin Authentication Required', 'Please log in with an Admin account.', 'error');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkAdminUrl);
      window.removeEventListener('hashchange', checkAdminUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdmin]);

  const refreshData = () => {
    setPosts(promptStore.getPosts());
    setCategories(promptStore.getCategories());
  };

  // Reset infinite scroll count when search or category filter changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCategory]);

  // Scroll to top only when selecting a category
  useEffect(() => {
    if (selectedCategory) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  // Published posts sorted newest first
  const publishedPosts = useMemo(() => {
    return posts
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  // Filtered Posts based on Search & Category
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return publishedPosts.filter((post) => {
      const matchesCategory = selectedCategory ? post.categoryId === selectedCategory : true;
      const matchesSearch =
        query === '' ||
        post.title.toLowerCase().includes(query) ||
        post.fullPrompt.toLowerCase().includes(query) ||
        post.shortDescription.toLowerCase().includes(query) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [publishedPosts, selectedCategory, searchQuery]);

  // Infinite scroll trigger
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 6, filteredPosts.length));
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [filteredPosts.length]);

  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);
  const hasMore = visibleCount < filteredPosts.length;

  const stats = promptStore.getAdminStats();

  const handleOpenPromptModal = useCallback((post: PromptPost) => {
    promptStore.incrementViews(post.id);
    setActivePromptModal(post);
  }, []);

  const handleCopyPrompt = useCallback((post: PromptPost) => {
    promptStore.incrementCopies(post.id);
  }, []);

  const handleSavePost = (postData: Omit<PromptPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'copies'>) => {
    if (editingPostModal === 'new') {
      promptStore.addPost(postData);
      showToast('✓ Prompt Published', 'New AI prompt is live at the top of your feed');
    } else if (editingPostModal && typeof editingPostModal === 'object') {
      promptStore.updatePost(editingPostModal.id, postData);
      showToast('✓ Prompt Updated', 'Changes saved successfully');
    }
    setEditingPostModal(null);
    refreshData();
  };

  const handleSaveCategory = (catData: Omit<Category, 'id' | 'slug'>) => {
    if (editingCategoryModal === 'new') {
      promptStore.addCategory(catData);
      showToast('✓ Category Created', 'New category added');
    } else if (editingCategoryModal && typeof editingCategoryModal === 'object') {
      promptStore.updateCategory(editingCategoryModal.id, catData);
      showToast('✓ Category Updated', 'Category updated');
    }
    setEditingCategoryModal(null);
    refreshData();
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Protected Admin Dashboard Route
  if (showAdminDashboard) {
    if (!isAdmin) {
      // Direct access protection redirect
      setShowAdminDashboard(false);
      setShowLoginModal(true);
      showToast('Access Denied', 'Admin authentication required to access Dashboard.', 'error');
      return null;
    }

    return (
      <>
        <AdminDashboard
          posts={posts}
          categories={categories}
          stats={stats}
          activities={promptStore.getActivities()}
          onAddPost={() => setEditingPostModal('new')}
          onEditPost={(p) => setEditingPostModal(p)}
          onAddCategory={() => setEditingCategoryModal('new')}
          onEditCategory={(c) => setEditingCategoryModal(c)}
          onClose={() => setShowAdminDashboard(false)}
          onRefreshData={refreshData}
          onOpenPreviewModal={(p) => setActivePromptModal(p)}
          onOpenPageModal={(page) => setActivePageModal(page)}
        />

        {/* Modals triggerable from Admin Dashboard */}
        <PostFormModal
          isOpen={editingPostModal !== null}
          post={typeof editingPostModal === 'object' ? editingPostModal : null}
          categories={categories}
          onClose={() => setEditingPostModal(null)}
          onSave={handleSavePost}
        />

        <CategoryFormModal
          isOpen={editingCategoryModal !== null}
          category={typeof editingCategoryModal === 'object' ? editingCategoryModal : null}
          onClose={() => setEditingCategoryModal(null)}
          onSave={handleSaveCategory}
        />

        <PromptModal
          post={activePromptModal}
          categories={categories}
          allPosts={publishedPosts}
          onClose={() => setActivePromptModal(null)}
          onSelectPost={(p) => setActivePromptModal(p)}
          onCopyPrompt={handleCopyPrompt}
        />

        <PageModal page={activePageModal} onClose={() => setActivePageModal(null)} />
      </>
    );
  }

  // Maintenance Mode Check
  if (featureControls.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 shadow-xl animate-pulse">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black mb-2">Website Maintenance Mode</h1>
        <p className="text-zinc-400 max-w-md text-sm mb-6">
          We are currently performing scheduled maintenance and upgrades. Please check back shortly!
        </p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors"
        >
          Admin Sign In
        </button>
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={(isAdminUser) => {
              setShowLoginModal(false);
              if (isAdminUser) {
                setShowAdminDashboard(true);
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-blue-500/20 selection:text-blue-500 overflow-x-hidden">
      {/* Layered Background Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        {/* Top Banner Ad Position */}
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 pt-3 w-full">
          <AdBanner position="topBanner" settings={monetizationSettings} />
        </div>

        {/* 1. Header (Logo, Search, Nav links, Dark Mode, Hamburger Menu) */}
        <Header
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onNavigateHome={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAdminDashboard={() => {
            if (isAdmin) {
              setShowAdminDashboard(true);
            } else {
              setShowLoginModal(true);
              showToast('Admin Authentication Required', 'Please log in with an Admin account.', 'error');
            }
          }}
        />

        {/* 2. Main Feed Container (Max width 1400px / 1600px ultra-wide) */}
        <main className="w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6 sm:pb-10 flex-1 relative">
          {/* Welcome Desktop Hero Section */}
          {featureControls.homepageBanner && (
            <section className="pt-4 sm:pt-8 pb-14 sm:pb-20 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Hero Column */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-extrabold tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Curated AI Prompt Library</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                    Welcome, Sahil 👋
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                      Discover & Master AI Prompts
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl">
                    Explore thousands of production-ready, engineered prompts for ChatGPT, Gemini, Midjourney, Bing &amp; more. Updated daily for creators, designers, and developers.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('latest-posts-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-amber-300" />
                      <span>Explore Prompts</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                      }}
                      className="px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-blue-500" />
                      <span>All Categories</span>
                    </button>
                  </div>

                  <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-3 gap-4 max-w-lg">
                    <div>
                      <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{publishedPosts.length}+</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active Prompts</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{categories.length}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Categories</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">Daily</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Fresh Updates</p>
                    </div>
                  </div>
                </div>

                {/* Right Hero Column: Featured Showcase Card */}
                <div className="lg:col-span-5 relative">
                  {publishedPosts[0] ? (
                    <div className="relative group rounded-[2.5rem] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 p-2 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl backdrop-blur-xl">
                      <div className="relative rounded-[2rem] bg-white dark:bg-zinc-900 p-5 sm:p-6 overflow-hidden space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured Today
                          </span>
                          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            {publishedPosts[0].views || 0} views
                          </span>
                        </div>

                        <div className="w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50">
                          <img
                            src={publishedPosts[0].imageUrl}
                            alt={publishedPosts[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {publishedPosts[0].title}
                          </h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {publishedPosts[0].shortDescription}
                          </p>
                        </div>

                        <button
                          onClick={() => handleOpenPromptModal(publishedPosts[0])}
                          className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-md cursor-pointer"
                        >
                          <span>View Featured Prompt</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 p-8 text-center text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      <Sparkles className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm font-bold">Featured Prompt Library</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Homepage Banner Ad Position */}
          <div className="mb-8">
            <AdBanner position="homepageBanner" settings={monetizationSettings} />
          </div>

          {/* LATEST POSTS SECTION WITH OVERLAP DESIGN */}
          <section
            id="latest-posts-section"
            className="-mt-6 sm:-mt-10 relative z-20 rounded-[32px] sm:rounded-[2.5rem] bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl backdrop-blur-2xl p-6 sm:p-10 lg:p-12 mb-6 sm:mb-8"
          >
            {/* Section Heading */}
            {featureControls.latestPostsSection && (
              <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Browse Gallery</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                    {selectedCategoryObj
                      ? `${selectedCategoryObj.name} Prompts`
                      : searchQuery
                      ? `Results for "${searchQuery}"`
                      : 'Latest Posts'}
                  </h2>
                </div>

                <div className="text-xs font-semibold text-zinc-400">
                  Showing {visiblePosts.length} of {filteredPosts.length} prompts
                </div>
              </div>
            )}

            {/* Active Filter Bar */}
            {(selectedCategory || searchQuery) && (
              <div className="mb-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Filtered by:{' '}
                  {selectedCategoryObj && (
                    <span className="font-bold mr-3">
                      Category: {selectedCategoryObj.name}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="font-bold">
                      Search: "{searchQuery}"
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Reset Filters</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Grid Layout: 2 Mobile, 3 Tablet, 4 Desktop */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
                {visiblePosts.map((post, idx) => {
                  const showAdAfter =
                    monetizationSettings.positions.betweenPosts &&
                    monetizationSettings.adFrequency > 0 &&
                    (idx + 1) % monetizationSettings.adFrequency === 0;

                  return (
                    <React.Fragment key={post.id}>
                      <PromptCard
                        post={post}
                        onOpenModal={handleOpenPromptModal}
                      />

                      {showAdAfter && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 my-4">
                          <AdBanner position="betweenPosts" settings={monetizationSettings} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              /* Empty Search State */
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 shadow-lg">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                  No matching prompts found
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  Try adjusting your search term or select a different category to discover available AI prompts.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-500 transition-colors"
                >
                  Show All Prompts
                </button>
              </div>
            )}

            {/* Load More Posts Button */}
            {featureControls.loadMoreButton && (
              <div ref={observerRef} className="pt-12 pb-4 text-center">
                {hasMore ? (
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredPosts.length))}
                    className="px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Load More Prompts</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                  </button>
                ) : filteredPosts.length > 0 ? (
                  <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    ✨ You've reached the end of the prompt gallery
                  </p>
                ) : null}
              </div>
            )}
          </section>

          {/* Bottom Banner Ad Position */}
          <AdBanner position="bottomBanner" settings={monetizationSettings} />
        </main>

        {/* 6. Footer with Page Modal Trigger */}
        {featureControls.footer && (
          <Footer onOpenPage={(page) => setActivePageModal(page)} />
        )}
      </div>

      {/* Sticky Bottom Banner */}
      {monetizationSettings.enabled && monetizationSettings.positions.stickyBottomBanner && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 py-2">
          <AdBanner position="stickyBottomBanner" settings={monetizationSettings} />
        </div>
      )}

      {/* 7. Floating Back to Top Button */}
      {featureControls.backToTopButton && (
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={scrollToTop}
              aria-label="Back to Top"
              className={`fixed ${
                monetizationSettings.enabled && monetizationSettings.positions.stickyBottomBanner
                  ? 'bottom-20 sm:bottom-20'
                  : 'bottom-6 sm:bottom-8'
              } right-5 sm:right-8 z-40 p-3.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border border-white/20 backdrop-blur-md`}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* MODALS */}
      {/* Detail Post View Modal */}
      <PromptModal
        post={activePromptModal}
        categories={categories}
        allPosts={publishedPosts}
        onClose={() => setActivePromptModal(null)}
        onSelectPost={(p) => setActivePromptModal(p)}
        onCopyPrompt={handleCopyPrompt}
      />

      {/* Policy & Custom Page View Modal */}
      <PageModal page={activePageModal} onClose={() => setActivePageModal(null)} />

      {/* Firebase Login / Register Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(isAdminUser) => {
          setShowLoginModal(false);
          if (isAdminUser) {
            setShowAdminDashboard(true);
          }
        }}
      />

      {/* User Profile & My Favorites Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onOpenPrompt={handleOpenPromptModal}
        onOpenAdminDashboard={() => setShowAdminDashboard(true)}
      />

      {/* Add / Edit Post Form Modal */}
      <PostFormModal
        isOpen={editingPostModal !== null}
        post={typeof editingPostModal === 'object' ? editingPostModal : null}
        categories={categories}
        onClose={() => setEditingPostModal(null)}
        onSave={handleSavePost}
      />

      {/* Add / Edit Category Form Modal */}
      <CategoryFormModal
        isOpen={editingCategoryModal !== null}
        category={typeof editingCategoryModal === 'object' ? editingCategoryModal : null}
        onClose={() => setEditingCategoryModal(null)}
        onSave={handleSaveCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <LogoProvider>
            <AppContent />
          </LogoProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
