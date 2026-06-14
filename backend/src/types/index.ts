export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  coverImage: string | null;
  tags: string[];
  readTime: number;
  likes: number;
  likedByMe: boolean;
  pinned: boolean;
  authorName: string;
  publishDate: string;
  commentCount: number;
  category?: string | null;
  contentLength?: number;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  comments: CommentItem[];
}

export interface CommentItem {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  parentId: number | null;
  pinned: boolean;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  replies: CommentItem[];
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface BackgroundItem {
  id: number;
  filePath: string;
  url: string;
  name: string;
  size: number;
  originalName: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface SiteConfig {
  carouselEnabled: boolean;
  carouselInterval: number;
  carouselImageIds: number[];
  currentBackgroundId: number | null;
}