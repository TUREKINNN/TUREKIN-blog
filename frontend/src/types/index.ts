export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  publishDate: string;
  readTime: number;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  coverImage: string | null;
  pinned: boolean;
  authorName: string;
  category?: string | null;
}

export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  tags: string[];
  publishDate: string;
  readTime: number;
  likes: number;
  likedByMe: boolean;
  coverImage: string | null;
  pinned: boolean;
  authorName: string;
  commentCount: number;
  category?: string | null;
  contentLength?: number;
}

export interface Comment {
  id: number;
  authorId: number;
  author: string;
  authorRole: 'admin' | 'visitor' | 'guest';
  authorAvatar: string | null;
  content: string;
  date: string;
  createdAt: string;
  pinned: boolean;
  parentId: number | null;
  likedByMe: boolean;
  likesCount: number;
  replies?: Comment[];
}

export type ThemeMode = 'system' | 'light' | 'dark';