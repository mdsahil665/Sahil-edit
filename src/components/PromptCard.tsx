import React from 'react';
import { PromptPost } from '../types';
import { ArrowUpRight, Eye, Copy, Sparkles } from 'lucide-react';

interface PromptCardProps {
  post: PromptPost;
  onOpenModal: (post: PromptPost) => void;
}

export const PromptCard: React.FC<PromptCardProps> = React.memo(({ post, onOpenModal }) => {
  return (
    <article
      onClick={() => onOpenModal(post)}
      className="group relative flex flex-col h-full max-w-[380px] w-full mx-auto rounded-[2rem] bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md hover:shadow-2xl hover:shadow-blue-500/15 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 overflow-hidden cursor-pointer transform-gpu hover:-translate-y-1.5 backdrop-blur-md"
    >
      {/* Ambient Glow Gradient background on hover */}
      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-blue-600/0 via-indigo-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:via-indigo-600/20 group-hover:to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* 1. Image Container with Glass Overlay */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-950/90 overflow-hidden rounded-t-[2rem] border-b border-zinc-100 dark:border-zinc-800/60 p-2">
        <img
          src={post.imageUrl}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
          {post.tags && post.tags.length > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20 shadow-md">
              #{post.tags[0]}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Prompt
            </span>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/75 backdrop-blur-md text-zinc-300 text-[10px] font-bold border border-white/10 shadow-md">
            <Eye className="w-3 h-3 text-blue-400" />
            <span>{post.views || 0}</span>
          </div>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-2">
          {/* Prompt Title */}
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-snug line-clamp-2 tracking-tight">
            {post.title}
          </h2>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 font-normal">
            {post.shortDescription}
          </p>
        </div>

        {/* Card Footer Action */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>{post.copies || 0} copies</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(post);
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center gap-1.5 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all duration-200 shadow-md cursor-pointer shrink-0"
          >
            <span>Open</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </article>
  );
});

PromptCard.displayName = 'PromptCard';
