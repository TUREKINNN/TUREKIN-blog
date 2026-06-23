import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { useArticles } from '@/context/ArticleContext';
import { logger } from '@/utils/logger';
import { Shield, LogOut, Clock, FileText, Settings, Trash2, Plus, Eye, MessageCircle, Flame, Link2, Edit3, Save, X as XIcon, Menu, Upload, RefreshCw, Star, ExternalLink } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState<'stats' | 'articles' | 'logs' | 'friendLinks' | 'music' | 'category' | 'site'>('stats');

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

  // Music management
  const [musicList, setMusicList] = useState<any[]>([]);
  const [musicForm, setMusicForm] = useState({ name: '', artist: '', audioUrl: '', coverUrl: '' });
  const [musicSaving, setMusicSaving] = useState(false);

  const fetchMusic = useCallback(() => {
    fetch('/api/music', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => { if (json.success) setMusicList(json.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchMusic(); }, [fetchMusic]);

  const handleSaveMusic = async () => {
    const { name, artist, audioUrl, coverUrl } = musicForm;
    if (!name || !artist || !audioUrl || !coverUrl) return;
    setMusicSaving(true);
    try {
      const resp = await fetch('/api/music', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(musicForm),
      });
      const json = await resp.json();
      if (json.success) {
        fetchMusic();
        setMusicForm({ name: '', artist: '', audioUrl: '', coverUrl: '' });
      }
    } catch {} finally {
      setMusicSaving(false);
    }
  };

  const handleDeleteMusic = async (id: number) => {
    if (!confirm('确定删除此音乐？')) return;
    try {
      const resp = await fetch(`/api/music/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await resp.json();
      if (json.success) fetchMusic();
    } catch {}
  };

  // Category management
  const [categoryConfig, setCategoryConfig] = useState<any>({ categories: [] });
  const [categoryInput, setCategoryInput] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);

  const fetchCategories = useCallback(() => {
    fetch('/api/config/about', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategoryConfig(json.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (!categoryInput.trim()) return;
    setCategorySaving(true);
    try {
      const cats = JSON.parse(categoryConfig.categories || '[]') as string[];
      const newCategories = [...cats, categoryInput.trim()];
      const resp = await fetch('/api/config/about', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...categoryConfig, categories: newCategories }),
      });
      const json = await resp.json();
      if (json.success) {
        fetchCategories();
        setCategoryInput('');
      }
    } catch {} finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!confirm(`确定删除分类「${cat}」？`)) return;
    setCategorySaving(true);
    try {
      const cats = JSON.parse(categoryConfig.categories || '[]') as string[];
      const newCategories = cats.filter((c: string) => c !== cat);
      const resp = await fetch('/api/config/about', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...categoryConfig, categories: newCategories }),
      });
      const json = await resp.json();
      if (json.success) fetchCategories();
    } catch {} finally {
      setCategorySaving(false);
    }
  };

  // Site config management
  const [siteConfig, setSiteConfig] = useState({ siteName: '', siteDesc: '', avatarUrl: '' });
  const [siteSaving, setSiteSaving] = useState(false);

  const fetchSiteConfig = useCallback(() => {
    fetch('/api/config/about', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteConfig({
            siteName: json.data.siteName || '',
            siteDesc: json.data.siteDesc || '',
            avatarUrl: json.data.avatarUrl || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchSiteConfig(); }, [fetchSiteConfig]);

  const handleSaveSiteConfig = async () => {
    setSiteSaving(true);
    try {
      const resp = await fetch('/api/config/about', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig),
      });
      const json = await resp.json();
      if (json.success) {
        fetchSiteConfig();
      }
    } catch {} finally {
      setSiteSaving(false);
    }
  };

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
          <button onClick={() => setActiveSection('stats')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'stats' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>系统概览</button>
          <button onClick={() => setActiveSection('articles')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'articles' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>文章管理</button>
          <button onClick={() => { setActiveSection('logs'); refreshLogs(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'logs' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>安全日志</button>
          <button onClick={() => { setActiveSection('friendLinks'); fetchFriendLinks(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'friendLinks' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>友链管理</button>
          <button onClick={() => { setActiveSection('music'); fetchMusic(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'music' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>音乐管理</button>
          <button onClick={() => { setActiveSection('category'); fetchCategories(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'category' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>分类管理</button>
          <button onClick={() => { setActiveSection('site'); fetchSiteConfig(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'site' ? 'bg-apple-dark dark:bg-white text-white dark:text-apple-dark' : 'bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'}`}>站点设置</button>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white">
                文章列表（{articles.length} 篇）
              </h3>
              <Link
                to="/admin/publish"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all"
              >
                <Plus size={16} />
                发布新文章
              </Link>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">文章</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">日期</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">赞</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">评论</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">状态</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-apple-lightgray dark:text-apple-dark-lightgray flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-apple-dark dark:text-white truncate max-w-[200px] sm:max-w-xs font-medium">
                                {article.title}
                              </p>
                              <p className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray sm:hidden">
                                {article.publishDate}
                              </p>
                            </div>
                            {article.pinned && (
                              <span className="tag text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0">
                                置顶
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell whitespace-nowrap">
                          {article.publishDate}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-apple-gray dark:text-apple-dark-gray">
                            <Flame size={12} />
                            {article.likes}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-apple-gray dark:text-apple-dark-gray">
                            <MessageCircle size={12} />
                            {article.commentCount ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            to={`/article/${article.id}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <Eye size={12} />
                            查看
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AdminArticleActions
                            articleId={article.id}
                            articleTitle={article.title}
                            pinned={article.pinned}
                            compact
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white">
                音乐列表（{musicList.length} 首）
              </h3>
            </div>
            {/* Form */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-apple-dark dark:text-white mb-4">添加音乐</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={musicForm.name}
                    onChange={(e) => setMusicForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="歌曲名称"
                    maxLength={200}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                  <input
                    type="text"
                    value={musicForm.artist}
                    onChange={(e) => setMusicForm((prev) => ({ ...prev, artist: e.target.value }))}
                    placeholder="艺术家"
                    maxLength={200}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>
                <input
                  type="url"
                  value={musicForm.audioUrl}
                  onChange={(e) => setMusicForm((prev) => ({ ...prev, audioUrl: e.target.value }))}
                  placeholder="音频链接 https://"
                  maxLength={500}
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                <input
                  type="url"
                  value={musicForm.coverUrl}
                  onChange={(e) => setMusicForm((prev) => ({ ...prev, coverUrl: e.target.value }))}
                  placeholder="封面链接 https://"
                  maxLength={500}
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveMusic}
                    disabled={musicSaving || !musicForm.name || !musicForm.artist || !musicForm.audioUrl || !musicForm.coverUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <Save size={14} /> {musicSaving ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
            {/* List */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">音乐</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">艺术家</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {musicList.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {song.coverUrl && (
                              <img
                                src={song.coverUrl}
                                alt={song.name}
                                className="w-7 h-7 rounded object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-apple-dark dark:text-white font-medium truncate max-w-[200px]">{song.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-apple-gray dark:text-apple-dark-gray hidden sm:table-cell">{song.artist}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteMusic(song.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {musicList.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-apple-gray dark:text-apple-dark-gray text-sm">
                          暂无音乐，请使用上方表单添加
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'category' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white">
                分类管理
              </h3>
            </div>
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-apple-dark dark:text-white mb-4">添加分类</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="分类名称"
                  maxLength={50}
                  className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={categorySaving || !categoryInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  <Plus size={14} /> {categorySaving ? '添加中...' : '添加'}
                </button>
              </div>
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">分类</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-apple-gray dark:text-apple-dark-gray">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {(JSON.parse(categoryConfig.categories || '[]') as string[]).map((cat: string) => (
                      <tr key={cat} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-apple-dark dark:text-white font-medium">{cat}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!categoryConfig.categories || JSON.parse(categoryConfig.categories || '[]').length === 0) && (
                      <tr>
                        <td colSpan={2} className="px-4 py-10 text-center text-apple-gray dark:text-apple-dark-gray text-sm">
                          暂无分类
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'site' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-apple-dark dark:text-white">
                站点设置
              </h3>
            </div>
            <div className="card p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-apple-gray dark:text-apple-dark-gray mb-1">站点名称</label>
                  <input
                    type="text"
                    value={siteConfig.siteName}
                    onChange={(e) => setSiteConfig((prev) => ({ ...prev, siteName: e.target.value }))}
                    placeholder="站点名称"
                    maxLength={200}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-gray dark:text-apple-dark-gray mb-1">站点描述</label>
                  <input
                    type="text"
                    value={siteConfig.siteDesc}
                    onChange={(e) => setSiteConfig((prev) => ({ ...prev, siteDesc: e.target.value }))}
                    placeholder="站点描述"
                    maxLength={500}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-gray dark:text-apple-dark-gray mb-1">头像链接</label>
                  <input
                    type="url"
                    value={siteConfig.avatarUrl}
                    onChange={(e) => setSiteConfig((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="头像链接 https://"
                    maxLength={500}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSiteConfig}
                    disabled={siteSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    <Save size={14} /> {siteSaving ? '保存中...' : '保存设置'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );
}