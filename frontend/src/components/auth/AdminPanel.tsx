import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { useArticles } from '@/context/ArticleContext';
import { logger } from '@/utils/logger';
import { Shield, LogOut, Clock, FileText, Settings, Trash2, Plus, Eye, MessageCircle, Flame, Link2, Edit3, Save, X as XIcon, Music } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminArticleActions from '@/components/admin/AdminArticleActions';

const PERMISSION_COUNT: Record<string, number> = { admin: 14, visitor: 5, guest: 4 };

interface FriendLink {
  id: number;
  name: string;
  url: string;
  avatarUrl: string;
  description: string;
}

export default function AdminPanel() {
  const { user, isLoading, logout } = useAuth();
  const { articles } = useArticles();
  const [logs, setLogs] = useState(() => logger.getLogs());
  const [activeSection, setActiveSection] = useState<'stats' | 'articles' | 'logs' | 'friendLinks' | 'music' | 'categories' | 'siteInfo'>('stats');

  const refreshLogs = useCallback(() => {
    setLogs(logger.getLogs());
  }, []);

  const clearLogs = useCallback(() => {
    logger.clearLogs();
    setLogs([]);
  }, []);

  const securityLogs = logs.filter((l) => l.level === 'SECURITY');
  const errorLogs = logs.filter((l) => l.level === 'ERROR');
  const totalLikes = articles.reduce((sum, a) => sum + a.likes, 0);

  // Friend link management
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null);
  const [linkForm, setLinkForm] = useState({ name: '', url: '', avatarUrl: '', description: '' });
  const [linkSaving, setLinkSaving] = useState(false);

  const fetchFriendLinks = useCallback(() => {
    fetch('/api/friendlinks', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => { if (json.success) setFriendLinks(json.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchFriendLinks(); }, [fetchFriendLinks]);

  const resetLinkForm = () => {
    setEditingLink(null);
    setLinkForm({ name: '', url: '', avatarUrl: '', description: '' });
  };

  const handleSaveLink = async () => {
    const { name, url, avatarUrl, description } = linkForm;
    if (!name || !url || !avatarUrl || !description) return;
    setLinkSaving(true);
    try {
      const isEdit = !!editingLink;
      const resp = await fetch(`/api/friendlinks${isEdit ? '/' + editingLink.id : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm),
      });
      const json = await resp.json();
      if (json.success) {
        fetchFriendLinks();
        resetLinkForm();
      }
    } catch {} finally {
      setLinkSaving(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('确定删除此友链？')) return;
    try {
      const resp = await fetch(`/api/friendlinks/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await resp.json();
      if (json.success) fetchFriendLinks();
    } catch {}
  };

  return (
    <>
      <Helmet>
        <title>管理面板 - TUREKIN Blog</title>
      </Helmet>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-apple-gray dark:text-apple-dark-gray">验证身份中...</p>
          </div>
        </div>
      ) : (
      <div className="animate-slide-up article-detail">
        <header className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-apple-dark dark:text-white">
                  管理面板
                </h1>
                <p className="text-sm text-apple-gray dark:text-apple-dark-gray">
                  欢迎，{user?.displayName}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                         bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                         hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={16} />
              退出登录
            </button>
          </div>
        </header>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveSection('stats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'stats'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            系统概览
          </button>
          <button
            onClick={() => setActiveSection('articles')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'articles'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            文章管理
          </button>
          <button
            onClick={() => { setActiveSection('logs'); refreshLogs(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'logs'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            安全日志
          </button>
          <button
            onClick={() => { setActiveSection('friendLinks'); fetchFriendLinks(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'friendLinks'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            友链管理
          </button>
          <button
            onClick={() => setActiveSection('music')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'music'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            🎵 音乐
          </button>
          <button
            onClick={() => setActiveSection('categories')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'categories'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            📂 分类
          </button>
          <button
            onClick={() => setActiveSection('siteInfo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                       ${activeSection === 'siteInfo'
                         ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark'
                         : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
                       }`}
          >
            🌐 站点
          </button>
        </div>

        {activeSection === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <FileText size={20} className="mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-apple-dark dark:text-white">{articles.length}</p>
                <p className="text-xs text-apple-gray dark:text-apple-dark-gray">文章数</p>
              </div>
              <div className="card p-4 text-center">
                <MessageCircle size={20} className="mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-apple-dark dark:text-white">{articles.reduce((sum, a) => sum + (a.commentCount ?? 0), 0)}</p>
                <p className="text-xs text-apple-gray dark:text-apple-dark-gray">总评论数</p>
              </div>
              <div className="card p-4 text-center">
                <Flame size={20} className="mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-apple-dark dark:text-white">{totalLikes}</p>
                <p className="text-xs text-apple-gray dark:text-apple-dark-gray">总点赞数</p>
              </div>
              <div className="card p-4 text-center">
                <Clock size={20} className="mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-apple-dark dark:text-white">{logs.length}</p>
                <p className="text-xs text-apple-gray dark:text-apple-dark-gray">日志条目</p>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white mb-3">当前管理员信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-apple-gray dark:text-apple-dark-gray">用户名</span>
                  <span className="text-apple-dark dark:text-white font-mono">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apple-gray dark:text-apple-dark-gray">角色</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    <Shield size={10} />
                    管理员
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apple-gray dark:text-apple-dark-gray">权限数</span>
                  <span className="text-apple-dark dark:text-white">{user ? PERMISSION_COUNT[user.role] ?? 0 : 0} 项</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white mb-3">安全概览</h3>
              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{securityLogs.length}</p>
                  <p className="text-xs text-red-500 dark:text-red-400">安全事件</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{errorLogs.length}</p>
                  <p className="text-xs text-amber-500 dark:text-amber-400">错误记录</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'articles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-dark-900">文章列表（{articles.length} 篇）</h3>
              <Link to="/admin/publish" className="btn btn-primary text-xs"><Plus size={14} />发布新文章</Link>
            </div>

            {articles.length === 0 ? (
              <div className="card p-10 text-center text-dark-500">
                <FileText size={32} className="mx-auto mb-3 text-dark-400" />
                <p className="text-sm">还没有文章</p>
                <Link to="/admin/publish" className="inline-block mt-3 text-accent-400 hover:text-accent-300 text-sm font-medium">去发布第一篇 →</Link>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="text-left px-4 py-3 text-[0.7rem] font-medium text-dark-500 uppercase tracking-wider">文章</th>
                        <th className="text-left px-4 py-3 text-[0.7rem] font-medium text-dark-500 uppercase tracking-wider hidden sm:table-cell">日期</th>
                        <th className="text-center px-4 py-3 text-[0.7rem] font-medium text-dark-500 uppercase tracking-wider hidden sm:table-cell">赞</th>
                        <th className="text-center px-4 py-3 text-[0.7rem] font-medium text-dark-500 uppercase tracking-wider hidden sm:table-cell">评论</th>
                        <th className="text-right px-4 py-3 text-[0.7rem] font-medium text-dark-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {article.coverImage ? (
                                <img src={article.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-dark-200" loading="lazy" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                  <FileText size={16} className="text-dark-500" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-dark-900 truncate max-w-[200px] sm:max-w-xs font-medium text-sm">{article.title}</p>
                                  {article.pinned && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.6rem] font-semibold bg-accent-500/15 text-accent-400 flex-shrink-0">📌</span>}
                                </div>
                                <p className="text-[0.65rem] text-dark-500 sm:hidden mt-0.5">{article.publishDate} · {article.likes}赞 · {article.commentCount ?? 0}评</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-dark-500 hidden sm:table-cell whitespace-nowrap text-xs">{article.publishDate}</td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell"><span className="inline-flex items-center gap-1 text-dark-500 text-xs"><Flame size={11} />{article.likes}</span></td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell"><span className="inline-flex items-center gap-1 text-dark-500 text-xs"><MessageCircle size={11} />{article.commentCount ?? 0}</span></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/article/${article.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-dark-500 hover:text-dark-800 hover:bg-white/[0.04] transition-all"><Eye size={12} />查看</Link>
                              <AdminArticleActions articleId={article.id} articleTitle={article.title} pinned={article.pinned} compact />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'logs' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white flex items-center gap-2">
                <Settings size={16} />
                安全日志记录
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshLogs}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors"
                >
                  刷新
                </button>
                <button
                  onClick={clearLogs}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                  清空
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {logs.length === 0 ? (
                <p className="text-center text-sm text-apple-gray dark:text-apple-dark-gray py-10">
                  暂无日志记录
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {logs.map((log, i) => (
                    <div key={i} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0
                                        ${log.level === 'SECURITY' ? 'bg-red-500' :
                                          log.level === 'ERROR' ? 'bg-amber-500' :
                                          log.level === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                        />
                        <span className="text-xs font-mono text-apple-lightgray dark:text-apple-dark-lightgray">
                          {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded
                                        ${log.level === 'SECURITY' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                          log.level === 'ERROR' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                          log.level === 'WARN' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs text-apple-gray dark:text-apple-dark-gray">
                          [{log.category}]
                        </span>
                      </div>
                      <p className="text-sm text-apple-dark dark:text-white ml-5">{log.message}</p>
                      {log.details && (
                        <pre className="ml-5 mt-1 text-xs text-apple-lightgray dark:text-apple-dark-lightgray overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'friendLinks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white">
                友链列表（{friendLinks.length} 条）
              </h3>
            </div>

            {/* Form */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-apple-dark dark:text-white mb-4">
                {editingLink ? '编辑友链' : '添加友链'}
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={linkForm.name}
                    onChange={(e) => setLinkForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="站点名称"
                    maxLength={100}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                  <input
                    type="url"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="站点链接 https://"
                    maxLength={500}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>
                <input
                  type="url"
                  value={linkForm.avatarUrl}
                  onChange={(e) => setLinkForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="头像链接 https://"
                  maxLength={500}
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                <input
                  type="text"
                  value={linkForm.description}
                  onChange={(e) => setLinkForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="站点描述"
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLink}
                    disabled={linkSaving || !linkForm.name || !linkForm.url || !linkForm.avatarUrl || !linkForm.description}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <Save size={14} /> {linkSaving ? '保存中...' : '保存'}
                  </button>
                  {editingLink && (
                    <button
                      onClick={resetLinkForm}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-apple-dark dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <XIcon size={14} /> 取消
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">友链</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">描述</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {friendLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={link.avatarUrl}
                              alt={link.name}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-apple-dark dark:text-white font-medium truncate max-w-[120px]">{link.name}</p>
                              <p className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray truncate max-w-[120px]">{link.url}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">
                          <p className="truncate max-w-[200px]">{link.description}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingLink(link);
                                setLinkForm({ name: link.name, url: link.url, avatarUrl: link.avatarUrl, description: link.description });
                              }}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="编辑"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {friendLinks.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-apple-gray dark:text-apple-dark-gray text-sm">
                          暂无友链，请使用上方表单添加
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'music' && (
          <MusicManagerContent />
        )}

        {activeSection === 'categories' && (
          <CategoryManager />
        )}

        {activeSection === 'siteInfo' && (
          <SiteInfoManager />
        )}
      </div>
      )}
    </>
  );
}

function CategoryManager() {
  const [cats, setCats] = useState<string[]>(['Project','Hermes','周热点','杂谈','开发者说']);
  const [newCat, setNewCat] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/config/about').then(r => r.json()).then(j => {
      if (j.success && j.data?.categories) {
        try { setCats(JSON.parse(j.data.categories)); } catch { setCats(['Project','Hermes','周热点','杂谈','开发者说']); }
      }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const saveCats = async (newCats: string[]) => {
    setCats(newCats);
    try {
      await fetch('/api/config/about', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: JSON.stringify(newCats) }),
      });
    } catch(e) {}
  };

  const addCat = () => {
    const c = newCat.trim();
    if (c && !cats.includes(c)) saveCats([...cats, c]);
    setNewCat('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-dark-900">📂 分类管理</h3>
      <p className="text-xs text-dark-500">以下分类可供管理员在发布文章时选择：</p>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/10 text-accent-400 text-xs font-medium">
            {c}
            <button onClick={() => saveCats(cats.filter(x => x !== c))} className="hover:text-red-400 transition-colors">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="新分类名" className="search-box text-xs flex-1"
          onKeyDown={e => e.key === 'Enter' && addCat()} />
        <button onClick={addCat} className="btn btn-primary text-xs">添加</button>
      </div>
    </div>
  );
}

function MusicManagerContent() {
  const [songs, setSongs] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', artist: '', url: '', coverUrl: '' });
  const [saving, setSaving] = useState(false);

  const fetchSongs = useCallback(() => {
    fetch('/api/music').then(r => r.json()).then(j => { if (j.success) setSongs(j.data); }).catch(() => {});
  }, []);
  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  const addSong = async () => {
    if (!form.title || !form.url) return;
    setSaving(true);
    const r = await fetch('/api/music', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
    if ((await r.json()).success) { setForm({ title: '', artist: '', url: '', coverUrl: '' }); fetchSongs(); }
    setSaving(false);
  };

  const deleteSong = async (id: number) => {
    await fetch(`/api/music/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchSongs();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-dark-900">🎵 音乐管理</h3>
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="歌曲名 *" className="search-box" />
          <input value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} placeholder="艺术家" className="search-box" />
          <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="音频链接（直链MP3）*" className="search-box col-span-full" />
          <input value={form.coverUrl} onChange={e => setForm({...form, coverUrl: e.target.value})} placeholder="封面图片链接（可选）" className="search-box col-span-full" />
        </div>
        <button onClick={addSong} disabled={saving || !form.title || !form.url}
          className="btn btn-primary text-xs">{saving ? '添加中…' : '+ 添加歌曲'}</button>
      </div>
      {songs.length === 0 ? <p className="text-xs text-dark-500 text-center py-4">暂无歌曲，添加一首吧</p> :
        <div className="space-y-1">{songs.map((s: any) => (
          <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] text-sm">
            <Music size={12} className="text-accent-400" />
            <span className="text-dark-900 truncate flex-1">{s.title}</span>
            <span className="text-xs text-dark-500 hidden sm:inline">{s.artist}</span>
            <button onClick={() => deleteSong(s.id)} className="p-1 text-dark-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
          </div>
        ))}</div>
      }
    </div>
  );
}

function SiteInfoManager() {
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');
  const [siteAvatar, setSiteAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config/about').then(r => r.json()).then(j => {
      if (j.success) {
        setSiteName(j.data?.siteName || '');
        setSiteDesc(j.data?.siteDesc || '');
        setSiteAvatar(j.data?.siteAvatar || '');
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/about', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, siteDesc, siteAvatar }),
      });
      const json = await res.json();
      if (!json.success) {
        alert('保存失败：' + (json.error?.message || '未知错误'));
      }
    } catch(e: any) {
      alert('网络错误：' + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-dark-900">🌐 站点信息</h3>
      <p className="text-xs text-dark-500">此信息会显示在友链页面「本站信息」中。</p>
      <div className="card p-4 space-y-3">
        <div><label className="text-xs text-dark-500 mb-1 block">站点名称</label>
          <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="TUREKINのblog" className="search-box" /></div>
        <div><label className="text-xs text-dark-500 mb-1 block">站点描述</label>
          <input value={siteDesc} onChange={e => setSiteDesc(e.target.value)} placeholder="TUREKIN 的个人博客" className="search-box" /></div>
        <div><label className="text-xs text-dark-500 mb-1 block">头像链接</label>
          <input value={siteAvatar} onChange={e => setSiteAvatar(e.target.value)} placeholder="https://www.turekin.me/avatar/user.png" className="search-box" /></div>
        <button onClick={save} disabled={saving} className="btn btn-primary text-xs">{saving ? '保存中…' : '保存'}</button>
      </div>
    </div>
  );
}
function MusicManagerContent_END() {}