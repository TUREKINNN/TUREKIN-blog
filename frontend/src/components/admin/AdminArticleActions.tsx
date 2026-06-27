import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Pin, MoreHorizontal, Copy, ExternalLink } from 'lucide-react';
import { useArticles } from '@/context/ArticleContext';
import { useToast } from '@/context/ToastContext';

interface AdminArticleActionsProps {
  articleId: number;
  articleTitle: string;
  pinned?: boolean;
  onAfterAction?: () => void;
  compact?: boolean;
}

export default function AdminArticleActions({
  articleId,
  pinned,
  onAfterAction,
  compact = false,
}: AdminArticleActionsProps) {
  const { deleteArticle, togglePinArticle } = useArticles();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); setConfirmDelete(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleEdit = useCallback(() => {
    navigate(`/admin/edit/${articleId}`);
  }, [navigate, articleId]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const ok = await deleteArticle(articleId);
    setConfirmDelete(false);
    setMenuOpen(false);
    if (ok) addToast('文章已删除', 'success');
    else addToast('删除失败', 'error');
    onAfterAction?.();
  }, [confirmDelete, deleteArticle, articleId, onAfterAction, addToast]);

  const handleTogglePin = useCallback(async () => {
    const result = await togglePinArticle(articleId);
    setMenuOpen(false);
    if (result) {
      addToast(result.pinned ? '已置顶' : '已取消置顶', 'success');
    } else {
      addToast('操作失败', 'error');
    }
    onAfterAction?.();
  }, [togglePinArticle, articleId, onAfterAction, addToast]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/article/${articleId}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast('链接已复制', 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      addToast('链接已复制', 'success');
    }
    setMenuOpen(false);
    onAfterAction?.();
  }, [articleId, addToast, onAfterAction]);

  const handleOpenArticle = useCallback(() => {
    window.open(`/article/${articleId}`, '_blank');
    setMenuOpen(false);
    onAfterAction?.();
  }, [articleId, onAfterAction]);

  const openMenu = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 176;
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    if (left < 8) left = 8;
    setMenuPos({ top: rect.bottom + 4, left });
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setConfirmDelete(false);
  }, []);

  const renderDropdownMenu = () => {
    if (!menuOpen || !menuPos) return null;
    return (
      <>
        <div className="fixed inset-0 z-[9998]" onClick={closeMenu} />
        <div
          className="fixed z-[9999] w-44 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button onClick={handleTogglePin} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-apple-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Pin size={14} className={pinned ? 'text-amber-500' : ''} />
            {pinned ? '取消置顶' : '置顶文章'}
          </button>
          <button onClick={handleEdit} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-apple-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Edit size={14} />
            编辑文章
          </button>
          <button onClick={handleCopyLink} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-apple-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Copy size={14} />
            复制链接
          </button>
          <button onClick={handleOpenArticle} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <ExternalLink size={14} />
            新窗口打开
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={handleDelete}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${confirmDelete ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold' : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
          >
            <Trash2 size={14} />
            {confirmDelete ? '确认删除？' : '删除文章'}
          </button>
        </div>
      </>
    );
  };

  if (compact) {
    return (
      <>
        <button
          ref={triggerRef}
          onClick={openMenu}
          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          aria-label="文章操作：编辑、置顶、删除"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          title="文章操作：编辑、置顶、删除"
        >
          <MoreHorizontal size={16} />
        </button>
        {createPortal(renderDropdownMenu(), document.body)}
      </>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleTogglePin}
        className={`btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${pinned ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
        title={pinned ? '取消置顶' : '置顶文章'}
      >
        <Pin size={13} />
        {pinned ? '已置顶' : '置顶'}
      </button>
      <button onClick={handleEdit} className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-blue-500 transition-all flex items-center gap-1.5">
        <Edit size={13} />编辑
      </button>
      <button onClick={handleCopyLink} className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-green-500 transition-all flex items-center gap-1.5">
        <Copy size={13} />复制
      </button>
      <button onClick={handleDelete} className={`btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${confirmDelete ? 'text-red-400 border-red-500/30' : 'text-red-500 hover:text-red-400'}`}>
        <Trash2 size={13} />
        {confirmDelete ? '确认删除' : '删除'}
      </button>
      {confirmDelete && (
        <button onClick={() => setConfirmDelete(false)} className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-gray-400 transition-all">
          取消
        </button>
      )}
    </div>
  );
}
