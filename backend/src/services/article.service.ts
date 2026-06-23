import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { notFound } from '../utils/errors';
import type { ArticleListItem, ArticleDetail, PaginatedResponse, CommentItem } from '../types';
const PAGE_SIZE = 100;

const articleSelect = {
  id: true,
  title: true,
  summary: true,
  coverImage: true,
  tags: true,
  category: true,
  readTime: true,
  likes: true,
  pinned: true,
  publishDate: true,
  content: true,
  author: { select: { displayName: true } },
  _count: { select: { comments: true } },
} as const;

type ArticleSelectResult = {
  id: number;
  title: string;
  summary: string;
  coverImage: string | null;
  content: string;
  tags: unknown;
  category: string | null;
  readTime: number;
  likes: number;
  pinned: boolean;
  publishDate: Date;
  author: { displayName: string };
  _count: { comments: number };
};

export async function listArticles(
  page: number,
  tag?: string,
  search?: string,
  userId?: number,
): Promise<PaginatedResponse<ArticleListItem>> {
  const where: Prisma.ArticleWhereInput = {};

  if (tag) {
    where.tags = { array_contains: tag };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
    ];
  }

  const [items, total, likedArticleIds] = await Promise.all([
    prisma.article.findMany({
      where,
      select: articleSelect,
      orderBy: [{ pinned: 'desc' }, { publishDate: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.article.count({ where }),
    userId
      ? prisma.articleLike.findMany({
          where: { userId },
          select: { articleId: true },
        }).then((rows: any[]) => new Set(rows.map((r: any) => r.articleId)))
      : Promise.resolve(new Set<number>()),
  ]);

  return {
    items: items.map((a: any) => formatListItem(a as unknown as ArticleSelectResult, likedArticleIds.has(a.id))),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getArticle(id: number, userId?: number): Promise<ArticleDetail> {
  const article = await prisma.article.findUnique({
    where: { id },
    select: { ...articleSelect, content: true, authorId: true },
  });
  if (!article) throw notFound('文章不存在');

  const [comments, likedByMe] = await Promise.all([
    getArticleComments(id, userId),
    userId
      ? prisma.articleLike.findUnique({ where: { articleId_userId: { articleId: id, userId } } }).then((r: any) => !!r)
      : Promise.resolve(false),
  ]);

  const item = formatListItem(article as unknown as ArticleSelectResult & { content: string; authorId: number }, likedByMe);
  return { ...item, content: article.content, comments };
}

async function getArticleComments(articleId: number, userId?: number): Promise<CommentItem[]> {
  const all = await prisma.comment.findMany({
    where: { articleId },
    include: {
      author: { select: { displayName: true, avatarUrl: true, role: true } },
      likes: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const commentMap = new Map<number, CommentItem>();
  const roots: CommentItem[] = [];

  for (const c of all) {
    const likedByMe = userId ? c.likes.some((l: any) => l.userId === userId) : false;
    const item: CommentItem = {
      id: c.id,
      content: c.content,
      authorId: c.authorId,
      authorName: c.author.displayName,
      authorAvatar: c.author.avatarUrl,
      authorRole: c.author.role,
      parentId: c.parentId,
      pinned: c.pinned,
      likesCount: c.likesCount,
      likedByMe,
      createdAt: c.createdAt.toISOString(),
      replies: [],
    };
    commentMap.set(c.id, item);
    if (c.parentId) {
      const parent = commentMap.get(c.parentId);
      if (parent) parent.replies.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

export async function toggleArticleLike(articleId: number, userId: number): Promise<{ liked: boolean; likes: number }> {
  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { likes: true } });
  if (!article) throw notFound('文章不存在');

  try {
    // Try to create first (optimistic for "like" case)
    await prisma.articleLike.create({ data: { articleId, userId } });
    const updated = await prisma.article.update({
      where: { id: articleId },
      data: { likes: { increment: 1 } },
    });
    return { liked: true, likes: updated.likes };
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // Already exists → unlike
      await prisma.articleLike.delete({ where: { articleId_userId: { articleId, userId } } });
      const updated = await prisma.article.update({
        where: { id: articleId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false, likes: updated.likes };
    }
    throw e;
  }
}

function autoCategory(tags: string[]): string | null {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  if (tags[0] !== 'Hermes') return null; // 非 Hermes 文章不自动分类
  if (tags.some(t => t.includes('Project'))) return 'Project';
  if (tags.some(t => t.includes('周热点'))) return '周热点';
  if (tags.some(t => t.includes('日记'))) return 'Hermes';
  return '杂谈';
}

export async function createArticle(data: {
  title: string; summary: string; content: string;
  coverImage?: string; tags: string[]; readTime: number; authorId: number;
  category?: string | null;
}): Promise<ArticleListItem> {
  const cat = data.category ?? autoCategory(data.tags);
  const article = await prisma.article.create({
    data: {
      ...data,
      tags: data.tags as any,
      coverImage: data.coverImage || null,
      publishDate: new Date(),
      category: cat,
    },
    select: articleSelect,
  });
  return formatListItem(article as unknown as ArticleSelectResult);
}

export async function updateArticle(id: number, data: {
  title?: string; summary?: string; content?: string;
  coverImage?: string | null; tags?: string[]; readTime?: number;
  category?: string | null;
}): Promise<ArticleListItem> {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw notFound('文章不存在');

  const updateData: Prisma.ArticleUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
  if (data.tags !== undefined) updateData.tags = data.tags as any;
  if (data.readTime !== undefined) updateData.readTime = data.readTime;
  if (data.category !== undefined) updateData.category = data.category;

  const article = await prisma.article.update({ where: { id }, data: updateData, select: articleSelect });
  return formatListItem(article as unknown as ArticleSelectResult);
}

export async function deleteArticle(id: number): Promise<void> {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw notFound('文章不存在');
  await prisma.article.delete({ where: { id } });
}

export async function togglePinArticle(id: number): Promise<boolean> {
  const article = await prisma.article.findUnique({ where: { id }, select: { pinned: true } });
  if (!article) throw notFound('文章不存在');
  const pinned = !article.pinned;
  await prisma.article.update({ where: { id }, data: { pinned } });
  return pinned;
}

function formatListItem(
  a: ArticleSelectResult,
  likedByMe = false,
): ArticleListItem {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    coverImage: a.coverImage,
    tags: Array.isArray(a.tags) ? a.tags : [],
    readTime: a.readTime,
    likes: a.likes,
    likedByMe,
    pinned: a.pinned,
    authorName: a.author.displayName,
    publishDate: a.publishDate instanceof Date ? a.publishDate.toISOString().split('T')[0] : String(a.publishDate),
    commentCount: a._count?.comments ?? 0,
    category: a.category || null,
    contentLength: a.content ? a.content.replace(/<[^>]*>/g, '').replace(/[\s\n\r]+/g, '').length : 0,
  };
}