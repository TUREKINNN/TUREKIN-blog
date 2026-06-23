import { Code2, Palette, Zap, Edit2, Check, X, ExternalLink, Unlink, Link2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ImageUpload from '@/components/ImageUpload';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const DEFAULT_HEADER_SUBTITLE = '一个热爱前端开发的技术博客';
const DEFAULT_BIO = '专注于 React、TypeScript 和 Web 性能优化。热爱开源，喜欢探索前端技术的前沿领域。这个博客记录了我的学习心得和技术分享，希望能帮助到同样热爱前端开发的你。';
const DEFAULT_TECHS = 'React · TypeScript · Tailwind CSS';
const DEFAULT_DESIGN = '极简 · 毛玻璃 · Apple风格';
const DEFAULT_PERF = '懒加载 · 代码分割 · SEO';
const DEFAULT_SUBTITLE = '前端开发工程师';

interface FriendLink {
  id: number;
  name: string;
  url: string;
  avatarUrl: string;
  description: string;
}

export default function AboutPage() {
  const { user, siteOwnerAvatarCached, siteOwnerName, siteOwnerDisplayName } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [headerSubtitle, setHeaderSubtitle] = useState(DEFAULT_HEADER_SUBTITLE);
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [techs, setTechs] = useState(DEFAULT_TECHS);
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [perf, setPerf] = useState(DEFAULT_PERF);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [githubUrl, setGithubUrl] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/config/about', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json.success || !json.data) return;
        setHeaderSubtitle(json.data.headerSubtitle || DEFAULT_HEADER_SUBTITLE);
        setBio(json.data.bio || DEFAULT_BIO);
        setTechs(json.data.techs || DEFAULT_TECHS);
        setDesign(json.data.design || DEFAULT_DESIGN);
        setPerf(json.data.perf || DEFAULT_PERF);
        setSubtitle(json.data.subtitle || DEFAULT_SUBTITLE);
        setGithubUrl(json.data.githubUrl || '');
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch('/api/friendlinks')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setFriendLinks(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = useCallback((dataUrl: string) => {
    setUploadedImage(dataUrl);
  }, []);

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const resp = await fetch('/api/config/about', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headerSubtitle, bio, techs, design, perf, subtitle, githubUrl }),
      });
      const json = await resp.json();
      if (json.success) {
        addToast('关于页面已更新', 'success');
        setEditing(false);
      } else {
        addToast(json.error?.message || '保存失败', 'error');
      }
    } catch {
      addToast('网络错误', 'error');
    } finally {
      setSaving(false);
    }
  }, [headerSubtitle, bio, techs, design, perf, subtitle, githubUrl, addToast]);

  return (
    <>
      <Helmet>
        <title>{`关于 - ${siteOwnerDisplayName}のblog`}</title>
        <meta name="description" content={`关于 ${siteOwnerDisplayName} 技术博客`} />
      </Helmet>

      <div className="animate-slide-up article-detail">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-apple-dark dark:text-white mb-3">
            关于本站
          </h1>
          {editing ? (
            <input
              type="text"
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              maxLength={50}
              className="w-full max-w-xs mx-auto p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
            />
          ) : (
            <p className="text-apple-gray dark:text-apple-dark-gray">
              {headerSubtitle}
            </p>
          )}
          {isAdmin && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <Edit2 size={14} /> 编辑
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <Check size={14} /> {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-apple-dark dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <X size={14} /> 取消
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        <div className="card p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            {siteOwnerAvatarCached && siteOwnerAvatarCached.includes('/uploads/') && !avatarError ? (
              <img
                src={siteOwnerAvatarCached}
                alt={siteOwnerDisplayName}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                loading="lazy"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {siteOwnerName}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-apple-dark dark:text-white">
                {siteOwnerDisplayName}
              </h2>
              {editing ? (
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  maxLength={30}
                  className="w-full p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
              ) : (
                <p className="text-sm text-apple-gray dark:text-apple-dark-gray">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
            />
          ) : (
            <p className="text-sm text-apple-gray dark:text-apple-dark-gray leading-relaxed">
              {bio}
            </p>
          )}

          {(githubUrl || (editing && isAdmin)) && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {!editing && githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-apple-dark dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                  <ExternalLink size={12} className="text-apple-gray" />
                </a>
              ) : editing && isAdmin ? (
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-apple-dark dark:text-white flex-shrink-0" aria-hidden="true">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username"
                    className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                  {githubUrl && (
                    <button
                      type="button"
                      onClick={() => setGithubUrl('')}
                      title="取消链接"
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Unlink size={16} />
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 text-center">
            <Code2 size={28} className="mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold text-apple-dark dark:text-white mb-1 text-sm">
              技术栈
            </h3>
            {editing ? (
              <input
                type="text"
                value={techs}
                onChange={(e) => setTechs(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            ) : (
              <p className="text-xs text-apple-gray dark:text-apple-dark-gray">
                {techs}
              </p>
            )}
          </div>
          <div className="card p-5 text-center">
            <Palette size={28} className="mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold text-apple-dark dark:text-white mb-1 text-sm">
              设计风格
            </h3>
            {editing ? (
              <input
                type="text"
                value={design}
                onChange={(e) => setDesign(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            ) : (
              <p className="text-xs text-apple-gray dark:text-apple-dark-gray">
                {design}
              </p>
            )}
          </div>
          <div className="card p-5 text-center">
            <Zap size={28} className="mx-auto mb-3 text-yellow-500" />
            <h3 className="font-semibold text-apple-dark dark:text-white mb-1 text-sm">
              性能优化
            </h3>
            {editing ? (
              <input
                type="text"
                value={perf}
                onChange={(e) => setPerf(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-apple-dark dark:text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            ) : (
              <p className="text-xs text-apple-gray dark:text-apple-dark-gray">
                {perf}
              </p>
            )}
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-apple-dark dark:text-white mb-4">
            图片上传测试
          </h3>
          <p className="text-sm text-apple-gray dark:text-apple-dark-gray mb-4">
            在这里测试图片上传功能，支持拖拽或点击上传，支持 JPEG、PNG、WebP、GIF 格式
          </p>
          <ImageUpload onImageUpload={handleImageUpload} />
          {uploadedImage && (
            <p className="mt-3 text-xs text-green-500 dark:text-green-400">
              ✓ 图片上传成功，可在控制台查看 data URL
            </p>
          )}
        </div>

        {friendLinks.length > 0 && (
          <div className="card p-6 sm:p-8 mt-8 border-l-4 border-blue-400 dark:border-blue-500">
            <h3 className="text-lg font-semibold text-apple-dark dark:text-white mb-4 flex items-center gap-2">
              <Link2 size={20} className="text-blue-500" />
              友站链接
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friendLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <img
                    src={link.avatarUrl}
                    alt={link.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23e5e7eb" width="40" height="40"/%3E%3Ctext x="20" y="26" text-anchor="middle" fill="%239ca3af" font-size="16"%3E?%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-dark dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {link.name}
                    </p>
                    <p className="text-xs text-apple-gray dark:text-apple-dark-gray truncate">
                      {link.description}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-apple-lightgray dark:text-apple-dark-lightgray flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
