import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { SearchX, X, ChevronDown, ArrowUp, Wrench } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-blue-500/20 selection:text-blue-500">
      {/* Top Banner Ad Position */}
      <div className="max-w-4xl mx-auto px-4 pt-3">
        <AdBanner position="topBanner" settings={monetizationSettings} />
      </div>

      {/* 1. Header (Logo, Search, Dark Mode, Hamburger Menu ☰) */}
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

      {/* 2. Main Feed Container */}
      <main className={`mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 ${monetizationSettings.enabled && monetizationSettings.positions.desktopSidebar ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {/* Welcome Section */}
        {featureControls.homepageBanner && (
          <div className="mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white font-sans">
              Welcome, Sahil 👋
            </h1>
            <p className="mt-3 text-base sm:text-xl text-zinc-500 dark:text-zinc-400 font-medium">
              Discover the latest AI prompts updated daily.
            </p>
          </div>
        )}

        {/* Homepage Banner Ad Position */}
        <div className="mb-8">
          <AdBanner position="homepageBanner" settings={monetizationSettings} />
        </div>

        {/* Active Filter Bar (When Category or Search is selected) */}
        {(selectedCategory || searchQuery) && (
          <div className="mb-10 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
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

        {/* Section Heading: "Latest Posts" */}
        {featureControls.latestPostsSection && (
          <div className="mb-8 sm:mb-10 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {selectedCategoryObj
                ? `${selectedCategoryObj.name} Posts`
                : searchQuery
                ? `Results for "${searchQuery}"`
                : 'Latest Posts'}
            </h2>
          </div>
        )}

        {/* Feed & Sidebar Grid */}
        <div className={monetizationSettings.enabled && monetizationSettings.positions.desktopSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-8' : ''}>
          <div className={monetizationSettings.enabled && monetizationSettings.positions.desktopSidebar ? 'lg:col-span-8' : ''}>
            {/* 4. Vertical Prompt Feed with Interspersed In-Feed Ads */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-12 sm:space-y-16">
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
                        <AdBanner position="betweenPosts" settings={monetizationSettings} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              /* Empty Search State */
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  No posts found
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  We couldn't find any posts matching your criteria. Try resetting search filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-500 transition-colors"
                >
                  Show All Latest Posts
                </button>
              </div>
            )}

            {/* 5. Load More Posts Button / Status */}
            {featureControls.loadMoreButton && (
              <div ref={observerRef} className="pt-16 pb-8 text-center">
                {hasMore ? (
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredPosts.length))}
                    className="px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 inline-flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Load More Posts</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                  </button>
                ) : filteredPosts.length > 0 ? (
                  <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                    No more posts available.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Desktop Sidebar Ad Column */}
          {monetizationSettings.enabled && monetizationSettings.positions.desktopSidebar && (
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2">
                    Sponsored Content
                  </span>
                  <AdBanner position="desktopSidebar" settings={monetizationSettings} />
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Bottom Banner Ad Position */}
        <AdBanner position="bottomBanner" settings={monetizationSettings} />
      </main>

      {/* 6. Footer with Page Modal Trigger */}
      {featureControls.footer && (
        <Footer onOpenPage={(page) => setActivePageModal(page)} />
      )}

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
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
