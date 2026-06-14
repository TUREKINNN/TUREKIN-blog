import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Article, ArticleListItem, Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface ArticleContextValue {
  articles: ArticleListItem[];
  totalCount: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  fetchArticles: (page?: number, tag?: string, search?: string) => Promise<void>;
  getArticle: (id: number) => Promise<Article | null>;
  createArticle: (data: { title: string; summary: string; content: string; tags: string[]; coverImage?: string | null; readTime?: number; category?: string | null }) => Promise<ArticleListItem | null>;
  updateArticle: (id: number, data: { title?: string; summary?: string; content?: string; tags?: string[]; coverImage?: string | null; readTime?: number; publishDate?: string; category?: string | null }) => Promise<ArticleListItem | null>;
  deleteArticle: (id: number) => Promise<boolean>;
  togglePinArticle: (id: number) => Promise<ArticleListItem | null>;
  addComment: (articleId: number, content: string, parentId?: number) => Promise<Comment | null>;
  deleteComment: (commentId: number) => Promise<boolean>;
  togglePinComment: (commentId: number) => Promise<boolean>;
  toggleLike: (articleId: number) => Promise<{ liked: boolean; likes: number } | null>;
  toggleCommentLike: (commentId: number) => Promise<boolean>;
}

const ArticleContext = createContext<ArticleContextValue | null>(null);

function mapCommentItem(c: Record<string, unknown>): Comment {
  return {
    id: c.id as number,
    authorId: (c.authorId as number) || 0,
    author: (c.authorName as string) || (c.author as string) || '用户',
    authorRole: (c.authorRole as Comment['authorRole']) || 'guest',
    authorAvatar: (c.authorAvatar as string) || null,
    content: c.content as string,
    date: (c.createdAt as string) || (c.date as string) || '',
    createdAt: (c.createdAt as string) || (c.date as string) || '',
    pinned: (c.pinned as boolean) || false,
    parentId: (c.parentId as number) || null,
    likedByMe: (c.likedByMe as boolean) || false,
    likesCount: (c.likesCount as number) || 0,
    replies: Array.isArray(c.replies) ? c.replies.map(mapCommentItem) : undefined,
  };
}

function mapArticleListItem(a: Record<string, unknown>): ArticleListItem {
  return {
    id: a.id as number,
    title: a.title as string,
    summary: a.summary as string,
    tags: Array.isArray(a.tags) ? a.tags as string[] : [],
    publishDate: a.publishDate as string,
    readTime: a.readTime as number,
    likes: a.likes as number,
    likedByMe: (a.likedByMe as boolean) || false,
    coverImage: (a.coverImage as string) || null,
    pinned: (a.pinned as boolean) || false,
    authorName: a.authorName as string,
    commentCount: (a.commentCount as number) ?? 0,
  };
}

function mapArticle(a: Record<string, unknown>): Article {
  return {
    ...mapArticleListItem(a),
    content: a.content as string,
    comments: Array.isArray(a.comments) ? (a.comments as Record<string, unknown>[]).map(mapCommentItem) : [],
  };
}

export function ArticleProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchArticles = useCallback(async (page = 1, tag?: string, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (tag) params.set('tag', tag);
      if (search) params.set('search', search);

      const res = await fetch(`/api/articles?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || '获取文章失败');

      const data = json.data;
      setArticles((data.items as Record<string, unknown>[]).map(mapArticleListItem));
      setTotalCount(data.total as number);
      setCurrentPage(data.page as number);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '网络错误';
      console.error('[ArticleContext] fetchArticles failed:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  const getArticle = useCallback(async (id: number): Promise<Article | null> => {
    try {
      const res = await fetch(`/api/articles/${id}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || '文章不存在');
      return mapArticle(json.data);
    } catch (e) {
      console.error('[ArticleContext] getArticle failed:', e instanceof Error ? e.message : e);
      return null;
    }
  }, []);

  const createArticle = useCallback(async (data: {
    title: string; summary: string; content: string; tags: string[]; coverImage?: string | null; readTime?: number;
  }): Promise<ArticleListItem | null> => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      const created = mapArticleListItem(json.data);
      setArticles((prev) => [created, ...prev]);
      setTotalCount((prev) => prev + 1);
      return created;
    } catch (e) {
      console.error('[ArticleContext] createArticle failed:', e instanceof Error ? e.message : e);
      return null;
    }
  }, []);

  const updateArticle = useCallback(async (id: number, data: {
    title?: string; summary?: string; content?: string; tags?: string[]; coverImage?: string | null; readTime?: number; publishDate?: string;
  }): Promise<ArticleListItem | null> => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      const updated = mapArticleListItem(json.data);
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (e) {
      console.error('[ArticleContext] updateArticle failed:', e instanceof Error ? e.message : e);
      return null;
    }
  }, []);

  const deleteArticle = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (e) {
      console.error('[ArticleContext] deleteArticle failed:', e instanceof Error ? e.message : e);
      return false;
    }
  }, []);

  const togglePinArticle = useCallback(async (id: number): Promise<ArticleListItem | null> => {
    try {
      const res = await fetch(`/api/articles/${id}/pin`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      const newPinned = (json.data as Record<string, unknown>).pinned as boolean;
      let updated: ArticleListItem | null = null;
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            updated = { ...a, pinned: newPinned };
            return updated;
          }
          return a;
        }),
      );
      return updated;
    } catch (e) {
      console.error('[ArticleContext] togglePinArticle failed:', e instanceof Error ? e.message : e);
      return null;
    }
  }, []);

  const addComment = useCallback(async (articleId: number, content: string, parentId?: number): Promise<Comment | null> => {
    try {
      const body: Record<string, unknown> = { content };
      if (parentId) body.parentId = parentId;

      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return mapCommentItem(json.data);
    } catch (e) {
      console.error('[ArticleContext] addComment failed:', e instanceof Error ? e.message : e);
      return null;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      return json.success;
    } catch (e) {
      console.error('[ArticleContext] deleteComment failed:', e instanceof Error ? e.message : e);
      return false;
    }
  }, []);

  const togglePinComment = useCallback(async (commentId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/comments/${commentId}/pin`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const json = await res.json();
      return json.success;
    } catch (e) {
      console.error('[ArticleContext] togglePinComment failed:', e instanceof Error ? e.message : e);
      return false;
    }
  }, []);

  const toggleLike = useCallback(async (articleId: number): Promise<{ liked: boolean; likes: number } | null> => {
    try {
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      const result = json.data as { liked: boolean; likes: number };
      setArticles((prev) => prev.map((a) =>
        a.id === articleId ? { ...a, likes: result.likes, likedByMe: result.liked } : a
      ));
      return result;
    } catch (e) {
      console.error('[ArticleContext] toggleLike failed:', e instanceof Error ? e.message : e);
      return null;
    }
  }, []);

  const toggleCommentLike = useCallback(async (commentId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      return json.success;
    } catch (e) {
      console.error('[ArticleContext] toggleCommentLike failed:', e instanceof Error ? e.message : e);
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    articles,
    totalCount,
    currentPage,
    loading,
    error,
    fetchArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    togglePinArticle,
    addComment,
    deleteComment,
    togglePinComment,
    toggleLike,
    toggleCommentLike,
  }), [articles, totalCount, currentPage, loading, error, fetchArticles, getArticle, createArticle, updateArticle, deleteArticle, togglePinArticle, addComment, deleteComment, togglePinComment, toggleLike, toggleCommentLike]);

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles(): ArticleContextValue {
  const ctx = useContext(ArticleContext);
  if (!ctx) throw new Error('useArticles 必须在 ArticleProvider 内使用');
  return ctx;
}