import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { notFound, forbidden } from '../utils/errors';
import type { CommentItem } from '../types';

export async function addComment(
  articleId: number, authorId: number, content: string, parentId?: number,
): Promise<CommentItem> {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw notFound('文章不存在');

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.articleId !== articleId) throw notFound('父评论不存在');
  }

  const comment = await prisma.comment.create({
    data: { articleId, authorId, content, parentId: parentId || null },
    include: {
      author: { select: { displayName: true, avatarUrl: true, role: true } },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    authorId: comment.authorId,
    authorName: comment.author.displayName,
    authorAvatar: comment.author.avatarUrl,
    authorRole: comment.author.role,
    parentId: comment.parentId,
    pinned: comment.pinned,
    likesCount: 0,
    likedByMe: false,
    createdAt: comment.createdAt.toISOString(),
    replies: [],
  };
}

export async function deleteComment(commentId: number, userId: number, role: string): Promise<void> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw notFound('评论不存在');
  if (comment.authorId !== userId && role !== 'admin') throw forbidden('无权删除此评论');
  await prisma.comment.delete({ where: { id: commentId } });
}

export async function updateComment(commentId: number, userId: number, content: string): Promise<CommentItem> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { author: { select: { displayName: true, avatarUrl: true, role: true } } },
  });
  if (!comment) throw notFound('评论不存在');
  if (comment.authorId !== userId) throw forbidden('无权修改此评论');

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: { author: { select: { displayName: true, avatarUrl: true, role: true } } },
  });

  return {
    id: updated.id,
    content: updated.content,
    authorId: updated.authorId,
    authorName: updated.author.displayName,
    authorAvatar: updated.author.avatarUrl,
    authorRole: updated.author.role,
    parentId: updated.parentId,
    pinned: updated.pinned,
    likesCount: updated.likesCount,
    likedByMe: false,
    createdAt: updated.createdAt.toISOString(),
    replies: [],
  };
}

export async function togglePinComment(commentId: number): Promise<boolean> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { pinned: true } });
  if (!comment) throw notFound('评论不存在');
  const pinned = !comment.pinned;
  await prisma.comment.update({ where: { id: commentId }, data: { pinned } });
  return pinned;
}

export async function toggleCommentLike(commentId: number, userId: number): Promise<boolean> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw notFound('评论不存在');

  try {
    await prisma.commentLike.create({ data: { commentId, userId } });
    await prisma.comment.update({ where: { id: commentId }, data: { likesCount: { increment: 1 } } });
    return true;
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      await prisma.commentLike.delete({ where: { commentId_userId: { commentId, userId } } });
      await prisma.comment.update({ where: { id: commentId }, data: { likesCount: { decrement: 1 } } });
      return false;
    }
    throw e;
  }
}
