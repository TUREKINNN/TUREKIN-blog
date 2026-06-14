import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useArticles } from '@/context/ArticleContext';

interface LikeButtonProps {
  articleId: number;
  initialLikes: number;
  initialLiked?: boolean;
}

export default function LikeButton({ articleId, initialLikes, initialLiked = false }: LikeButtonProps) {
  const { toggleLike } = useArticles();

  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [animating, setAnimating] = useState(false);

  const handleLike = useCallback(async () => {
    const result = await toggleLike(articleId);
    if (result !== null) {
      setLikes(result.likes);
      setLiked(result.liked);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }
  }, [toggleLike, articleId]);

  return (
    <button
      onClick={handleLike}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 ease-in-out
        ${liked
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
      aria-label={liked ? '取消点赞' : '点赞'}
      title={liked ? '取消点赞' : '点赞'}
    >
      <Heart
        size={18}
        className={`transition-all duration-200 ${liked ? 'fill-current' : ''} ${animating ? 'animate-heart-beat' : ''}`}
      />
      <span>{likes}</span>
    </button>
  );
}