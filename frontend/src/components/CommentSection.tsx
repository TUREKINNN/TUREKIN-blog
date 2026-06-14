import { useState, useCallback, useMemo } from 'react';
import { MessageCircle, Send, Trash2, Pin, Heart, Reply, Edit, X } from 'lucide-react';
import type { Comment } from '@/types';
import { useArticles } from '@/context/ArticleContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function formatRelativeTime(iso: string): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
  return new Date(iso).toLocaleDateString('zh-CN');
}

interface CommentSectionProps {
  comments: Comment[];
  articleId: number;
  onCommentsChanged?: () => void;
}

export default function CommentSection({ comments, articleId, onCommentsChanged }: CommentSectionProps) {
  const { addComment, deleteComment, togglePinComment, toggleCommentLike } = useArticles();
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const topLevelComments = useMemo(() => {
    return comments.filter((c) => !c.parentId);
  }, [comments]);

  const getReplies = useCallback((parentId: number) => {
    return comments.filter((c) => c.parentId === parentId);
  }, [comments]);

  const sortedComments = useMemo(() => {
    return [...topLevelComments].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [topLevelComments]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;

      setSubmitting(true);
      const result = await addComment(articleId, content.trim(), replyTo?.id);

      if (result) {
        setContent('');
        setReplyTo(null);
        onCommentsChanged?.();
      }

      setSubmitting(false);
    },
    [content, articleId, addComment, replyTo, onCommentsChanged],
  );

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      const ok = await deleteComment(commentId);
      if (ok) { addToast('评论已删除', 'success'); onCommentsChanged?.(); }
      else addToast('删除失败', 'error');
    },
    [deleteComment, onCommentsChanged, addToast],
  );

  const handlePinComment = useCallback(
    async (commentId: number) => {
      const ok = await togglePinComment(commentId);
      if (ok) onCommentsChanged?.();
    },
    [togglePinComment, onCommentsChanged],
  );

  const handleLikeComment = useCallback(
    async (commentId: number) => {
      await toggleCommentLike(commentId);
      onCommentsChanged?.();
    },
    [toggleCommentLike, onCommentsChanged],
  );

  const handleStartEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }, []);

  const handleSaveEdit = useCallback(
    async (commentId: number) => {
      if (!editContent.trim()) return;
      const resp = await fetch(`/api/articles/0/comments/${commentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const json = await resp.json();
      if (json.success) {
        addToast('评论已修改', 'success');
        setEditingId(null);
        onCommentsChanged?.();
      } else {
        addToast(json.error?.message || '修改失败', 'error');
      }
    },
    [editContent, addToast, onCommentsChanged],
  );

  const canEditComment = useCallback(
    (comment: Comment): boolean => {
      if (!user) return false;
      return comment.authorId === (user as any).id;
    },
    [user],
  );

  const canDeleteComment = useCallback(
    (comment: Comment): boolean => {
      if (isAdmin) return true;
      if (user && comment.authorId === (user as any).id) return true;
      return false;
    },
    [isAdmin, user],
  );

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = (comment.replies && comment.replies.length > 0) ? comment.replies : getReplies(comment.id);
    const liked = comment.likedByMe;
    const authorRole = comment.authorRole || 'guest';
    const roleLabel = authorRole === 'admin' ? '管理员' : authorRole === 'visitor' ? '访客' : '游客';
    const displayName = (comment as any).authorName || comment.author;
    const timeDisplay = formatRelativeTime(comment.createdAt || comment.date);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8' : ''}`}>
        <div className={`card p-4 animate-fade-in ${comment.pinned ? 'ring-2 ring-amber-300 dark:ring-amber-600' : ''}`}>
          <div className="flex items-start gap-3">
            <img
              src={comment.authorAvatar || '/avatar/visitor.png'}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatar/visitor.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {comment.pinned && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <Pin size={10} />
                    已置顶
                  </span>
                )}
                <span className="font-semibold text-sm text-apple-dark dark:text-white">
                  {displayName}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                  ${authorRole === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    authorRole === 'visitor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {roleLabel}
                </span>
                <span className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray">
                  {timeDisplay}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    maxLength={5000}
                    className="comment-input"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200"
                    >
                      <X size={12} className="inline mr-1" />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-apple-dark-gray leading-relaxed">
                  {comment.content}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`inline-flex items-center gap-1 text-xs transition-colors
                    ${liked
                      ? 'text-red-500'
                      : 'text-apple-lightgray dark:text-apple-dark-lightgray hover:text-red-400'
                    }`}
                  aria-label={liked ? '取消点赞' : '点赞'}
                >
                  <Heart size={13} className={liked ? 'fill-current animate-heart-beat' : ''} />
                  {comment.likesCount > 0 && (
                    <span>{comment.likesCount}</span>
                  )}
                </button>

                {!isReply && (
                  <button
                    onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, author: displayName })}
                    className={`inline-flex items-center gap-1 text-xs transition-colors
                      ${replyTo?.id === comment.id
                        ? 'text-blue-500'
                        : 'text-apple-lightgray dark:text-apple-dark-lightgray hover:text-blue-400'
                      }`}
                    aria-label="回复"
                  >
                    <Reply size={13} />
                    回复
                  </button>
                )}

                {(canEditComment(comment) || canDeleteComment(comment) || (isAdmin && hasPermission('comment:pin'))) && (
                  <div className="flex items-center gap-0.5 ml-auto">
                    {canEditComment(comment) && editingId !== comment.id && (
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        title="编辑评论"
                      >
                        <Edit size={13} />
                      </button>
                    )}
                    {isAdmin && hasPermission('comment:pin') && (
                      <button
                        onClick={() => handlePinComment(comment.id)}
                        className={`p-1 rounded-lg transition-all ${
                          comment.pinned
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        }`}
                        aria-label={comment.pinned ? '取消置顶评论' : '置顶评论'}
                        title={comment.pinned ? '取消置顶' : '置顶评论'}
                      >
                        <Pin size={13} />
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        aria-label="删除评论"
                        title="删除评论"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  const authorLabel = user
    ? (user.role === 'guest' ? '游客' : user.displayName)
    : '请先登录';

  return (
    <section className="space-y-6" aria-label="评论区">
      <div className="flex items-center gap-2">
        <MessageCircle size={20} className="text-apple-dark dark:text-white" />
        <h3 className="text-lg font-semibold text-apple-dark dark:text-white">
          评论 ({comments.length})
        </h3>
        {isAdmin && (
          <span className="tag text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            管理员可管理所有评论
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-apple-gray dark:text-apple-dark-gray">
          <img
            src={user?.avatar || '/avatar/visitor.png'}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
          <span>评论身份：{authorLabel}</span>
          {replyTo && (
            <span className="text-blue-500">
              回复 @{replyTo.author}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-1 text-xs text-gray-400 hover:text-gray-600"
              >
                取消
              </button>
            </span>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyTo ? `回复 @${replyTo.author}...` : '写下你的想法...'}
          rows={3}
          maxLength={500}
          required
          className="comment-input"
          aria-label="评论内容"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {content.length}/500
          </span>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send size={14} />
            {submitting ? '发送中...' : replyTo ? '回复' : '发表评论'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {sortedComments.map((comment) => renderComment(comment))}

        {comments.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
            暂无评论，来发表第一条评论吧
          </p>
        )}
      </div>
    </section>
  );
}