import React from 'react';
import { PromptPost } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PromptCardProps {
  post: PromptPost;
  onOpenModal: (post: PromptPost) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ post, onOpenModal }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpenModal(post)}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 dark:hover:border-zinc-700/80 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* 1. Large Uncropped Image */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-950/80 flex items-center justify-center p-2 sm:p-3 rounded-t-3xl border-b border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          loading="lazy"
          className="w-full h-auto max-h-[600px] object-contain rounded-2xl transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
          }}
        />
      </div>

      {/* 2. Content: Title & Short Description & 3. Open Button */}
      <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 gap-6">
        <div className="space-y-3">
          {/* Prompt Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-snug tracking-tight">
            {post.title}
          </h2>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3 font-normal">
            {post.shortDescription}
          </p>
        </div>

        {/* Open Button */}
        <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(post);
            }}
            className="px-5 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs sm:text-sm flex items-center gap-2 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all duration-200 shadow-md"
          >
            <span>Open</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
