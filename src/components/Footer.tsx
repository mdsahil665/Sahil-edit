import React from 'react';
import { Sparkles, Instagram, Facebook, Github, Youtube, ArrowUp, Zap, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomPage } from '../types';
import { promptStore } from '../services/promptStore';
import { AdBanner } from './AdBanner';

interface FooterProps {
  onOpenPage: (page: CustomPage) => void;
}

// Custom X (Twitter) Icon
const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom Telegram Icon
const TelegramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.18-1.82 6.97-3.02 8.38-3.61 3.98-1.66 4.81-1.95 5.35-1.96.12 0 .38.03.55.17.14.12.18.28.2.45-.02.07-.02.21-.04.38z" />
  </svg>
);

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const formatSocialUrl = (url?: string, platform?: string) => {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('@')) {
    const handle = trimmed.substring(1);
    if (platform === 'instagram') return `https://instagram.com/${handle}`;
    if (platform === 'facebook') return `https://facebook.com/${handle}`;
    if (platform === 'twitter') return `https://twitter.com/${handle}`;
    if (platform === 'telegram') return `https://t.me/${handle}`;
    if (platform === 'youtube') return `https://youtube.com/@${handle}`;
    return `https://${platform || 'instagram'}.com/${handle}`;
  }
  if (!trimmed.includes('.')) {
    if (platform === 'instagram') return `https://instagram.com/${trimmed}`;
    if (platform === 'facebook') return `https://facebook.com/${trimmed}`;
    if (platform === 'twitter') return `https://twitter.com/${trimmed}`;
    if (platform === 'telegram') return `https://t.me/${trimmed}`;
    if (platform === 'youtube') return `https://youtube.com/@${trimmed}`;
  }
  return `https://${trimmed}`;
};

export const Footer: React.FC<FooterProps> = ({ onOpenPage }) => {
  const pages = promptStore.getPages().filter((p) => p.status === 'published');
  const monetizationSettings = promptStore.getMonetization();
  const websiteSettings = promptStore.getWebsiteSettings();
  const fc = promptStore.getFeatureControls();
  const social = websiteSettings.socialLinks;
  const footerText = websiteSettings.footerText || '© 2026 Sahil Edits. All Rights Reserved.';

  const socialItems = [
    {
      id: 'instagram',
      label: 'Instagram',
      url: formatSocialUrl(social?.instagram, 'instagram'),
      icon: <Instagram className="w-4 h-4" />,
      hoverClass: 'hover:text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/30',
      enabled: fc.instagramToggle,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      url: formatSocialUrl(social?.facebook),
      icon: <Facebook className="w-4 h-4" />,
      hoverClass: 'hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30',
      enabled: fc.facebookToggle,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      url: formatSocialUrl(social?.whatsapp),
      icon: <WhatsAppIcon className="w-4 h-4" />,
      hoverClass: 'hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30',
      enabled: fc.whatsappToggle,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      url: formatSocialUrl(social?.telegram),
      icon: <TelegramIcon className="w-4 h-4" />,
      hoverClass: 'hover:text-sky-500 hover:bg-sky-500/10 hover:border-sky-500/30',
      enabled: fc.telegramToggle,
    },
    {
      id: 'youtube',
      label: 'YouTube',
      url: formatSocialUrl(social?.youtube),
      icon: <Youtube className="w-4 h-4" />,
      hoverClass: 'hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30',
      enabled: fc.youtubeToggle,
    },
    {
      id: 'twitter',
      label: 'X (Twitter)',
      url: formatSocialUrl(social?.twitter),
      icon: <XIcon className="w-4 h-4" />,
      hoverClass: 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-400',
      enabled: fc.twitterToggle,
    },
    {
      id: 'github',
      label: 'GitHub',
      url: formatSocialUrl(social?.github),
      icon: <Github className="w-4 h-4" />,
      hoverClass: 'hover:text-purple-500 hover:bg-purple-500/10 hover:border-purple-500/30',
      enabled: fc.githubToggle,
    },
  ].filter((item) => Boolean(item.url) && item.enabled !== false && fc.footerSocialLinks !== false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-gradient-to-b from-white via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/90 dark:to-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-14 pb-10 transition-colors duration-300 overflow-hidden"
    >
      {/* Top Stylish Multi-Color Glow Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 via-indigo-500 via-purple-500 to-transparent opacity-80" />

      {/* Decorative Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Footer Ad Banner */}
        <AdBanner position="footerBanner" settings={monetizationSettings} />

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info Section (5 cols) */}
          <div className="md:col-span-5 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-70 blur group-hover:opacity-100 transition duration-300" />
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                  {websiteSettings.websiteName || 'Sahil Edits'}
                </h3>
                <p className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                  {websiteSettings.tagline || 'Premium AI Prompt Library'}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto md:mx-0">
              Discover curated, high-converting AI prompts for Gemini, ChatGPT, Midjourney, and Bing. Copy instantly with 1-click precision.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <Zap className="w-3 h-3 text-blue-500" /> 1-Click Copy
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 100% Free
              </span>
            </div>
          </div>

          {/* Quick Pages / Links Section (4 cols) */}
          <div className="md:col-span-4 text-center md:text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Quick Navigation
            </h4>

            {pages.length > 0 ? (
              <ul className="flex flex-col items-center md:items-start gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {pages.map((page) => (
                  <li key={page.id}>
                    <button
                      onClick={() => onOpenPage(page)}
                      className="group inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-white transition-colors"
                    >
                      <span className="text-blue-500/70 group-hover:translate-x-0.5 transition-transform">›</span>
                      <span>{page.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                Explore thousands of curated AI prompts on our main feed.
              </p>
            )}
          </div>

          {/* Connect & Socials Section (3 cols) */}
          <div className="md:col-span-3 text-center md:text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Stay Connected
            </h4>

            {socialItems.length > 0 ? (
              <div className="flex items-center justify-center md:justify-start flex-wrap gap-2.5 pt-1">
                {socialItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className={`p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200 ${item.hoverClass}`}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Follow us for daily AI editing tips and fresh prompt drops.
              </p>
            )}

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-zinc-700 dark:text-zinc-300 transition-all shadow-sm"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Back to top
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          <div>{footerText}</div>
          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>for AI Creators</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
