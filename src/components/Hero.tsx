import React from 'react';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Sparkles, Search, Copy, Eye, TrendingUp, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  categories: Category[];
  totalPrompts: number;
  totalCopies: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const Hero: React.FC<HeroProps> = ({
  categories,
  totalPrompts,
  totalCopies,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sahil Edits • Curated AI Prompts</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]"
          >
            Unlock Next-Level AI Outputs with <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Precision Prompts</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Browse high-performing prompts for ChatGPT, Gemini, Claude, Midjourney, and Flux. Copy with one click, elevate your workflow instantly.
          </motion.p>

          {/* Large Hero Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search prompts (e.g., Cyberpunk Midjourney, SaaS Copywriter, Python Refactor)..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white dark:bg-zinc-900/90 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 font-medium text-sm sm:text-base shadow-xl shadow-blue-500/5 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <span>Instant Search</span>
              </div>
            </div>
          </motion.div>

          {/* Popular Quick Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Top Categories:
            </span>
            <button
              onClick={() => onSelectCategory(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              All
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50'
                }`}
              >
                <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            ))}
          </motion.div>

          {/* Key Metrics Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80"
          >
            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-center gap-1.5 text-blue-500 font-bold text-xl sm:text-2xl">
                <Zap className="w-5 h-5 fill-blue-500/20" />
                <span>{totalPrompts}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Verified Prompts</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-center gap-1.5 text-indigo-500 font-bold text-xl sm:text-2xl">
                <Copy className="w-5 h-5" />
                <span>{totalCopies.toLocaleString()}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Prompt Copies</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-bold text-xl sm:text-2xl">
                <ShieldCheck className="w-5 h-5" />
                <span>100%</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Free & Instant</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
