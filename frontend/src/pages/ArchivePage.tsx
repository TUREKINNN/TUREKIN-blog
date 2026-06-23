import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Folder, Rocket, BookOpen, Rss, Coffee, Code2 } from 'lucide-react';

interface ArticleData { id: number; title: string; date: string; tags: string[]; category: string | null; }

const DEFAULT_CATEGORIES = ['Project','Hermes','周热点','杂谈','开发者说'];
const CAT_ICONS: Record<string, any> = { Project: Rocket, Hermes: BookOpen, '周热点': Rss, '杂谈': Coffee, '开发者说': Code2 };

export default function ArchivePage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetch('/api/config/about').then(r => r.json()).then(j => {
      if (j.success && j.data?.categories) {
        try { setCategories(JSON.parse(j.data.categories)); } catch {}
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/articles?page=1&pageSize=100', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.items) {
          setArticles(json.data.items.map((a: any) => ({
            id: a.id, title: a.title,
            date: a.publishDate, tags: a.tags || [],
            category: a.category || null,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 分类计数
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: articles.length };
    articles.forEach(a => { if (a.category) m[a.category] = (m[a.category] || 0) + 1; });
    return m;
  }, [articles]);

  // 按分类筛选
  const filtered = useMemo(() => {
    if (activeCat === 'all') return articles;
    return articles.filter(a => a.category === activeCat);
  }, [articles, activeCat]);

  // 年份分组
  const grouped = useMemo(() => {
    const map = new Map<number, ArticleData[]>();
    filtered.forEach(a => {
      const y = parseInt(a.date.slice(0, 4));
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(a);
    });
    return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([y, items]) => [y, items.sort((x, y) => y.date.localeCompare(x.date))] as const);
  }, [filtered]);

  return <>
    <Helmet><title>归档 - TUREKIN Blog</title></Helmet>
    <div className="max-w-3xl mx-auto animate-slide-up">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-dark-800 transition-colors mb-8">
        <ArrowLeft size={15} /> 返回首页
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
          <Calendar size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dark-900">归档</h1>
          <p className="text-sm text-dark-500 mt-0.5">共 {articles.length} 篇文章</p>
        </div>
      </div>

      {/* 分类标签栏 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {[{key:'all',label:'归档',icon:Folder}, ...categories.map(c=>({key:c,label:c,icon:CAT_ICONS[c]||Folder}))].map(cat => {
          const count = counts[cat.key] || 0;
          const isActive = activeCat === cat.key;
          const Icon = cat.icon;
          return (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                ${isActive
                  ? 'bg-accent-500/15 text-accent-400 border border-accent-400/20'
                  : 'bg-white/[0.03] text-dark-500 hover:bg-white/[0.06] border border-transparent'}`}>
              <Icon size={14} />
              {cat.label}
              <span className={`text-xs ml-0.5 ${isActive ? 'text-accent-400/70' : 'text-dark-500/50'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 文章列表 */}
      {loading ? (
        <div className="space-y-8">
          {[1,2].map(y =>
            <div key={y}><div className="skeleton h-8 w-16 rounded mb-3"/><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-5 w-64 rounded"/>)}</div></div>
          )}
        </div>
      ) : grouped.length === 0 ? (
        <div className="card p-10 text-center text-dark-500">
          <FileText size={32} className="mx-auto mb-3 text-dark-400"/>
          <p className="text-sm">{activeCat === 'all' ? '还没有文章' : `${activeCat} 分类暂无文章`}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([year, items]) => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-dark-900 tracking-tight">{year}</span>
                <span className="w-2 h-2 rounded-full bg-accent-400" />
                <span className="text-sm text-dark-500">{items.length} 篇</span>
              </div>
              <div className="space-y-1 relative before:absolute before:left-[6px] before:top-0 before:bottom-0 before:w-px before:bg-white/[0.06]">
                {items.map(a => (
                  <Link key={a.id} to={`/article/${a.id}`}
                    className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors group relative">
                    <span className="absolute left-[3px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-accent-400/40 group-hover:bg-accent-400 group-hover:scale-150 transition-all flex-shrink-0" />
                    <span className="text-xs text-dark-500 font-mono w-12 flex-shrink-0 pl-3">{a.date.slice(5)}</span>
                    <span className="text-dark-800 group-hover:text-dark-900 transition-colors truncate flex-1 text-sm">{a.title}</span>
                    <span className="hidden sm:flex gap-1 flex-shrink-0">
                      {a.tags.slice(0, 3).map(t => <span key={t} className="text-[0.6rem] text-dark-500 px-1.5 py-0.5 rounded bg-white/[0.03]">{t}</span>)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>;
}
