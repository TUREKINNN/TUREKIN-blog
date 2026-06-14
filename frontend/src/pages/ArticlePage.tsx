import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowLeft, Clock, Calendar, ArrowUp, Share2, Link2, List } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import ImagePreview from '@/components/ImagePreview';
import HoverPreview from '@/components/HoverPreview';
import AdminArticleActions from '@/components/admin/AdminArticleActions';
import { useArticles } from '@/context/ArticleContext';
import { useAuth } from '@/context/AuthContext';
import { useBrowseTracker } from '@/hooks/useBrowseTracker';
import type { Article } from '@/types';

interface TocItem { id: string; text: string; level: number; }

function extractToc(md: string): TocItem[] {
  const re = /^(#{2,3})\s+(.+)$/gm; const items: TocItem[] = []; let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const t = m[2].trim();
    items.push({ id: t.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, ''), text: t, level: m[1].length });
  }
  return items;
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { getArticle } = useArticles();
  const { user, siteOwnerDisplayName } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [activeTocId, setActiveTocId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAdmin = user?.role === 'admin';
  const articleId = id ? parseInt(id) : NaN;
  useBrowseTracker(articleId);

  const toc = useMemo(() => article?.content ? extractToc(article.content) : [], [article?.content]);

  useEffect(() => {
    let ticking = false;
    const h = () => {
      if (!ticking) { requestAnimationFrame(() => {
        const st = document.documentElement.scrollTop, sh = document.documentElement.scrollHeight - window.innerHeight;
        setProgressWidth(sh > 0 ? Math.min((st / sh) * 100, 100) : 0);
        setShowBackToTop(st > 400);
        if (toc.length) {
          const hs = toc.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
          let a = toc[0]?.id || '';
          for (let i = hs.length - 1; i >= 0; i--) { if (hs[i] && hs[i].offsetTop - 120 <= st) { a = toc[i].id; break; } }
          setActiveTocId(a);
        }
        ticking = false;
      }); ticking = true; }
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [toc]);

  const wordCount = useMemo(() => article?.content ? article.content.replace(/[#*`\n\r\s>\[\]()!\-_=+|{}\\:;"'<>,./?~@$%^&]/g, '').length : 0, [article?.content]);

  useEffect(() => {
    if (isNaN(articleId)) { setLoading(false); setFetchError('无效 ID'); return; }
    let c = false; setLoading(true); setFetchError(null);
    getArticle(articleId).then(r => { if (c) return; setArticle(r); if (!r) setFetchError('文章不存在'); setLoading(false); window.scrollTo(0, 0); }).catch(() => { if (!c) { setFetchError('加载失败'); setLoading(false); } });
    return () => { c = true; };
  }, [articleId, getArticle]);

  const handleCommentsChanged = useCallback(() => { if (!isNaN(articleId)) getArticle(articleId).then(r => { if (r) setArticle(r); }); }, [articleId, getArticle]);
  const handleRetry = useCallback(() => {
    if (!isNaN(articleId)) { setLoading(true); setFetchError(null);
      getArticle(articleId).then(r => { setArticle(r); if (!r) setFetchError('文章不存在'); setLoading(false); }).catch(() => { setFetchError('加载失败'); setLoading(false); }); }
  }, [articleId, getArticle]);

  const handleShare = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || '')}`, '_blank'); }
  }, [article?.title]);

  const mdComponents = useMemo(() => ({
    code({ className, children, ...props }: any) {
      const m = /language-(\w+)/.exec(className || '');
      return !m ? <code className={className} {...props}>{children}</code> : (
        <SyntaxHighlighter style={oneDark} language={m[1]} PreTag="div" customStyle={{ borderRadius: '12px', fontSize: '14px', padding: '20px', background: '#0d0d12' }}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
      );
    },
    h2({ children, ...props }: any) { const id = String(children).toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, ''); return <h2 id={id} {...props}>{children}</h2>; },
    h3({ children, ...props }: any) { const id = String(children).toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, ''); return <h3 id={id} {...props}>{children}</h3>; },
    img({ src, alt }: any) { return src ? <HoverPreview src={src} alt={alt || ''} onClick={() => setPreviewSrc(src)} /> : null; },
  }), []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-7 w-20 rounded-lg" />
      <div className="skeleton h-56 w-full rounded-2xl" />
      <div className="skeleton h-9 w-3/4 rounded-lg" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-5/6 rounded" />
    </div>
  );

  if (!article) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-dark-900 mb-3">文章未找到</h1>
      <p className="text-dark-500 mb-5">{fetchError || '不存在或已被删除'}</p>
      <Link to="/" className="inline-flex items-center gap-1.5 text-accent-400 hover:text-accent-300 font-medium transition-colors"><ArrowLeft size={15} />返回首页</Link>
    </div>
  );

  return (<>
    <Helmet><title>{`${article.title} - ${siteOwnerDisplayName}のblog`}</title><meta name="description" content={article.summary} /></Helmet>
    <div id="reading-progress" style={{ width: `${progressWidth}%` }} />

    <div className="flex gap-8">
      {/* ==== 正文 ==== */}
      <article className="flex-1 min-w-0 animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-dark-500 hover:text-dark-800 transition-colors text-sm"><ArrowLeft size={15} />返回</Link>
          <div className="flex items-center gap-1">
            <button onClick={handleShare} className="share-btn" title="复制链接">{copied ? <span className="text-success text-xs">✓</span> : <Share2 size={15} />}</button>
            {toc.length > 0 && <button onClick={() => setTocOpen(!tocOpen)} className="share-btn lg:hidden"><List size={15} /></button>}
            {isAdmin && <AdminArticleActions articleId={article.id} articleTitle={article.title} pinned={article.pinned} />}
          </div>
        </div>

        {article.coverImage && (
          <div className="mb-10 -mx-4 sm:mx-0">
            <HoverPreview src={article.coverImage} alt={article.title} className="w-full rounded-none sm:rounded-2xl" onClick={() => setPreviewSrc(article.coverImage!)} />
          </div>
        )}

        {tocOpen && toc.length > 0 && (
          <details className="article-toc lg:hidden mb-8 card p-5" open>
            <summary className="!text-dark-700">📑 目录</summary>
            <nav className="mt-3">{toc.map(item => (
              <a key={item.id} href={`#${item.id}`} className={item.id === activeTocId ? 'toc-active' : ''} style={{ paddingLeft: `${(item.level - 2) * 12 + 8}px` }}
                onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{item.text}</a>
            ))}</nav>
          </details>
        )}

        <header className="mb-10">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.pinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-accent-500/15 text-accent-400">📌 置顶</span>}
            {article.tags.map(tag => { const s = getTagStyle(tag); return <span key={tag} className="tag-colored text-[0.65rem] font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>{tag}</span>; })}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-4 leading-tight tracking-tight text-balance">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500">
            <span className="inline-flex items-center gap-1.5"><Calendar size={13} />{article.publishDate}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={13} />{article.readTime} 分钟阅读</span>
            {wordCount > 0 && <span className="text-xs text-dark-400">{wordCount.toLocaleString()} 字</span>}
          </div>
        </header>

        <div className="prose max-w-none mb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{article.content}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-center gap-3 py-6 border-t border-white/[0.04]">
          <span className="text-xs text-dark-500">分享</span>
          <button onClick={handleShare} className="share-btn"><Link2 size={14} /></button>
          <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener" className="share-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>

        <div className="flex justify-center py-4 border-t border-white/[0.04]">
          <LikeButton articleId={article.id} initialLikes={article.likes} initialLiked={article.likedByMe} />
        </div>

        <div className="mt-4 pt-8 border-t border-white/[0.04]">
          <CommentSection comments={article.comments} articleId={article.id} onCommentsChanged={handleCommentsChanged} />
        </div>
      </article>

      {/* ==== 桌面端 TOC ==== */}
      {toc.length > 0 && (
        <aside className="hidden lg:block w-44 xl:w-52 flex-shrink-0">
          <div className="sticky top-24" style={{ maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}>
            <h4 className="text-[0.65rem] font-semibold text-dark-500 uppercase tracking-widest mb-4 flex items-center gap-1.5"><List size={12} />目录</h4>
            <nav className="article-toc">{toc.map(item => (
              <a key={item.id} href={`#${item.id}`} className={item.id === activeTocId ? 'toc-active' : ''} style={{ paddingLeft: `${(item.level - 2) * 10 + 8}px` }}
                onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{item.text}</a>
            ))}</nav>
          </div>
        </aside>
      )}
    </div>

    <button id="back-to-top" className={showBackToTop ? 'visible' : ''} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部"><ArrowUp size={18} /></button>
    {previewSrc && <ImagePreview src={previewSrc} alt={article.title} onClose={() => setPreviewSrc(null)} />}
  </>);
}

function getTagStyle(tag: string) {
  const m: Record<string, { bg: string; text: string }> = {
    'React': { bg: 'rgba(59,130,246,0.12)', text: '#93c5fd' },
    'TypeScript': { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc' },
    'CSS': { bg: 'rgba(236,72,153,0.12)', text: '#f9a8d4' },
    '前端': { bg: 'rgba(34,197,94,0.12)', text: '#86efac' },
    'Node.js': { bg: 'rgba(168,85,247,0.12)', text: '#d8b4fe' },
    'AI': { bg: 'rgba(139,92,246,0.12)', text: '#c4b5fd' },
    'Hermes': { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc' },
  };
  return m[tag] || { bg: 'rgba(255,255,255,0.06)', text: '#a1a1aa' };
}
