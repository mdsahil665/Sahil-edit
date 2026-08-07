import React, { useState, useEffect } from 'react';
import { PromptPost, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  X,
  Copy,
  Check,
  Share2,
  Eye,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  Facebook,
  Twitter,
  CheckCircle2,
  Lock,
  Unlock,
  Instagram,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { promptStore } from '../services/promptStore';
import { AdBanner } from './AdBanner';

interface PromptModalProps {
  post: PromptPost | null;
  categories: Category[];
  allPosts: PromptPost[];
  onClose: () => void;
  onSelectPost: (post: PromptPost) => void;
  onCopyPrompt: (post: PromptPost) => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  post,
  categories,
  allPosts,
  onClose,
  onSelectPost,
  onCopyPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);

  const { showToast } = useToast();
  const timerSettings = promptStore.getTimerSettings();
  const monetizationSettings = promptStore.getMonetization();
  const websiteSettings = promptStore.getWebsiteSettings();

  const getInstagramUrl = () => {
    const raw = websiteSettings.socialLinks?.instagram?.trim();
    if (!raw) return 'https://instagram.com';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('@')) return `https://instagram.com/${raw.substring(1)}`;
    if (raw.includes('instagram.com')) return `https://${raw}`;
    return `https://instagram.com/${raw}`;
  };

  const fc = promptStore.getFeatureControls();

  // Initialize Timer Countdown based on Feature Controls + Global + Post Override
  useEffect(() => {
    if (!post) return;

    let seconds = 0;

    // Check feature control first
    if (fc.timerLock === false) {
      seconds = 0;
    } else if (post.timerOverride) {
      if (post.timerOverride.enabled === false) {
        seconds = 0; // Explicitly disabled for this post
      } else if (typeof post.timerOverride.seconds === 'number') {
        seconds = post.timerOverride.seconds;
      } else {
        seconds = timerSettings.enabled ? timerSettings.defaultSeconds : 0;
      }
    } else {
      // Use global setting
      seconds = timerSettings.enabled ? timerSettings.defaultSeconds : 0;
    }

    setCountdown(seconds);
    setIsUnlocked(seconds === 0);

    if (seconds > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsUnlocked(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [post?.id, timerSettings.enabled, timerSettings.defaultSeconds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const category = categories.find((c) => c.id === post.categoryId);

  // Find related posts in the same category
  const relatedPosts = allPosts
    .filter((p) => p.categoryId === post.categoryId && p.id !== post.id)
    .slice(0, 3);

  // Previous & Next Navigation
  const currentIndex = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const handleCopyPrompt = () => {
    if (!isUnlocked) return;
    navigator.clipboard.writeText(post.fullPrompt);
    setCopied(true);
    onCopyPrompt(post);
    showToast('✓ Prompt Copied Successfully', 'Ready to paste into your AI assistant.');

    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const currentUrl = window.location.href;
  const shareTitle = encodeURIComponent(`Check out this AI Prompt: ${post.title} on Sahil Edits`);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(currentUrl)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setShareCopied(true);
    showToast('✓ Link Copied to Clipboard', 'Share it with your friends!');
    setTimeout(() => setShareCopied(false), 2000);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-zinc-950/80 backdrop-blur-md">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                  category?.bgLight || 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}
              >
                <CategoryIcon name={category?.icon || 'Sparkles'} className="w-3.5 h-3.5" />
                <span>{category?.name || 'General'}</span>
              </span>

              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" />
                  {post.copies} copies
                </span>
              </div>
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Ad Position: Inside Post Top */}
            <AdBanner position="insidePostTop" settings={monetizationSettings} />

            {/* Top Grid: Image + Meta Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Cover Image (Uncropped, Full Display) */}
              <div className="md:col-span-5 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-3 flex items-center justify-center">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto max-h-[550px] object-contain rounded-xl"
                />
              </div>

              {/* Title & Short Description */}
              <div className="md:col-span-7 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {post.shortDescription}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ad Position: Inside Prompt (Above Prompt Box) */}
            <AdBanner position="insidePrompt" settings={monetizationSettings} />

            {/* FULL PROMPT DISPLAY BOX WITH TIMER LOCK SYSTEM */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Full AI Prompt</span>
                    {!isUnlocked && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 flex items-center gap-1 animate-pulse">
                        <Lock className="w-3 h-3" /> Locked ({countdown}s)
                      </span>
                    )}
                  </h3>
                </div>

                {/* Ad Position: Before Copy Button */}
                <AdBanner position="beforeCopyButton" settings={monetizationSettings} />

                {/* Main Copy Prompt Button */}
                {(fc.promptCopy && fc.copyButton) && (
                  <button
                    onClick={handleCopyPrompt}
                    disabled={!isUnlocked}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                      !isUnlocked
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                        : copied
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95'
                    }`}
                  >
                    {!isUnlocked ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Unlocking in {countdown}s...</span>
                      </>
                    ) : copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 animate-bounce" />
                        <span>✓ Prompt Copied Successfully</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Full Prompt</span>
                      </>
                    )}
                  </button>
                )}

                {/* Ad Position: After Copy Button */}
                <AdBanner position="afterCopyButton" settings={monetizationSettings} />
              </div>

              {/* Prompt Box with Lock Overlay */}
              <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-5 font-mono text-sm text-zinc-100 leading-relaxed overflow-hidden shadow-inner select-text min-h-[120px]">
                {!isUnlocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/85 flex flex-col items-center justify-center p-6 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg animate-pulse">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">Prompt Locked by Timer</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Unlocking full prompt copy access in{' '}
                        <span className="font-mono font-bold text-amber-400 text-sm">{countdown} seconds</span>...
                      </p>
                    </div>

                    <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(countdown / (post.timerOverride?.seconds || timerSettings.defaultSeconds)) * 100}%` }}
                        transition={{ ease: 'linear', duration: 1 }}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  animate={{
                    filter: isUnlocked ? 'blur(0px)' : 'blur(6px)',
                    opacity: isUnlocked ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <pre className="whitespace-pre-wrap font-sans sm:font-mono">{post.fullPrompt}</pre>
                </motion.div>
              </div>
            </div>

            {/* Ad Position: Below Prompt */}
            <AdBanner position="belowPrompt" settings={monetizationSettings} />

            {/* SOCIAL SHARING BUTTONS SECTION */}
            {fc.socialShareButtons && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Share This Prompt:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {/* WhatsApp */}
                  {fc.whatsappToggle !== false && (
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-2 border border-emerald-500/20 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}

                  {/* Telegram */}
                  {fc.telegramToggle !== false && (
                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-semibold flex items-center gap-2 border border-sky-500/20 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Telegram
                    </a>
                  )}

                  {/* Facebook */}
                  {fc.facebookToggle !== false && (
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex items-center gap-2 border border-blue-500/20 transition-colors"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      Facebook
                    </a>
                  )}

                  {/* Instagram Link */}
                  {fc.instagramToggle !== false && (
                    <a
                      href={getInstagramUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 text-xs font-semibold flex items-center gap-2 border border-pink-500/20 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </a>
                  )}

                  {/* X / Twitter */}
                  {fc.twitterToggle !== false && (
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      X (Twitter)
                    </a>
                  )}

                  {/* Copy Direct Link */}
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    {shareCopied ? 'Link Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}

            {/* RELATED POSTS SECTION */}
            {(fc.relatedPosts && relatedPosts.length > 0) && (
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  More Prompts in {category?.name || 'this category'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectPost(rel)}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-full rounded-xl overflow-hidden mb-2 bg-zinc-100 dark:bg-zinc-950 p-1.5 flex items-center justify-center">
                          <img
                            src={rel.imageUrl}
                            alt={rel.title}
                            className="w-full h-auto max-h-[220px] object-contain rounded-lg"
                          />
                        </div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-500">
                          {rel.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-blue-500 font-semibold mt-2 flex items-center gap-1">
                        View Prompt →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer: Prev/Next Navigation */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            {prevPost ? (
              <button
                onClick={() => onSelectPost(prevPost)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline line-clamp-1 max-w-[150px]">Previous: {prevPost.title}</span>
                <span className="sm:hidden">Previous</span>
              </button>
            ) : <div />}

            {nextPost ? (
              <button
                onClick={() => onSelectPost(nextPost)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <span className="hidden sm:inline line-clamp-1 max-w-[150px]">Next: {nextPost.title}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : <div />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
