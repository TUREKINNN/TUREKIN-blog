import { Link } from 'react-router-dom';
import { Calendar, Clock, Heart, MessageCircle } from 'lucide-react';
import HoverPreview from './HoverPreview';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="card overflow-hidden animate-fade-in group flex flex-col">
      {article.coverImage && (
        <Link to={`/article/${article.id}`} className="block overflow-hidden">
          <HoverPreview
            src={article.coverImage}
            alt={article.title}
            className="w-full aspect-[16/10]"
          />
        </Link>
      )}

      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag !text-[10px] !px-2 !py-0.5">
              {tag}
            </span>
          ))}
          {article.tags.length > 2 && (
            <span className="tag !text-[10px] !px-2 !py-0.5">
              +{article.tags.length - 2}
            </span>
          )}
        </div>

        <Link to={`/article/${article.id}`} className="group/link flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-apple-dark dark:text-white mb-1.5 leading-snug line-clamp-2 group-hover/link:text-blue-500 dark:group-hover/link:text-blue-400 transition-colors duration-200">
            {article.title}
          </h3>
        </Link>

        <p className="text-xs text-apple-gray dark:text-apple-dark-gray leading-relaxed mb-3 line-clamp-2">
          {article.summary}
        </p>

        <div className="flex items-center justify-between text-[11px] text-apple-lightgray dark:text-apple-dark-lightgray mt-auto pt-3 border-t border-apple-border dark:border-apple-dark-border">
          <span className="inline-flex items-center gap-1">
            <Calendar size={10} />
            {article.publishDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={10} />
            {article.readTime}分
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={10} />
            {article.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={10} />
            {article.comments.length}
          </span>
        </div>
      </div>
    </article>
  );
}