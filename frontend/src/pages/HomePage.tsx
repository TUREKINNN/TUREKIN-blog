import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Pin, Search, Sparkles, FileText, Tag, Eye, TrendingUp, Film, LayoutGrid } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import TagFilter from '@/components/TagFilter';
import AdminArticleActions from '@/components/admin/AdminArticleActions';
import LazyImage from '@/components/LazyImage';
import CinemaView from '@/components/CinemaView';
import AlbumView from '@/components/AlbumView';
import { useArticles } from '@/context/ArticleContext';
import { useSearchFilter } from '@/context/SearchFilterContext';
import { useAuth } from '@/context/AuthContext';
import type { ArticleListItem } from '@/types';

/* ===== 彩色标签 ===== */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'React':{bg:'rgba(59,130,246,0.15)',text:'#93c5fd'},'TypeScript':{bg:'rgba(99,102,241,0.15)',text:'#a5b4fc'},
  'CSS':{bg:'rgba(236,72,153,0.15)',text:'#f9a8d4'},'前端':{bg:'rgba(34,197,94,0.15)',text:'#86efac'},
  'Node.js':{bg:'rgba(168,85,247,0.15)',text:'#d8b4fe'},'AI':{bg:'rgba(139,92,246,0.15)',text:'#c4b5fd'},
  'Hermes':{bg:'rgba(99,102,241,0.15)',text:'#a5b4fc'},'性能优化':{bg:'rgba(251,191,36,0.15)',text:'#fde68a'},
  '进化日记':{bg:'rgba(59,130,246,0.15)',text:'#93c5fd'},'AI成长':{bg:'rgba(139,92,246,0.15)',text:'#c4b5fd'},
  '自我介绍':{bg:'rgba(236,72,153,0.15)',text:'#f9a8d4'},'毕业季':{bg:'rgba(34,197,94,0.15)',text:'#86efac'},
  '本周热点':{bg:'rgba(251,191,36,0.15)',text:'#fde68a'},'Hello World':{bg:'rgba(99,102,241,0.15)',text:'#a5b4fc'},
  '开刊':{bg:'rgba(236,72,153,0.15)',text:'#f9a8d4'},'田径队':{bg:'rgba(34,197,94,0.15)',text:'#86efac'},
};
function tg(tag:string){return TAG_COLORS[tag]||{bg:'rgba(255,255,255,0.06)',text:'#a1a1aa'}}

/* ===== 动画数字 ===== */
function AnimatedNumber({value,d=900}:{value:number;d?:number}){
  const[disp,setDisp]=useState(value);const r=useRef<HTMLSpanElement>(null);const s=useRef(false);
  useEffect(()=>{
    if(value===0){setDisp(0);return}
    setDisp(value);
    const el=r.current;if(!el||s.current)return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!s.current){s.current=true;const t=performance.now();const a=(n:number)=>{const p=Math.min((n-t)/d,1);setDisp(Math.round(value*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(a)};requestAnimationFrame(a)}},{threshold:.3});o.observe(el);return()=>o.disconnect()},[value,d]);
  return<span ref={r}>{disp.toLocaleString()}</span>
}
const SITE_START = new Date('2026-05-26').getTime();

/* ===== 运行时长 ===== */
function RunningTime() {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - SITE_START;
      setDays(Math.floor(elapsed / 86400000));
    };
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);
  const h = Math.floor(((Date.now() - SITE_START) % 86400000) / 3600000);
  return <span style={{fontSize:'clamp(1.4rem,3vw,2.2rem)',fontWeight:700,letterSpacing:'-0.02em',color:'hsl(var(--theme-hue,250),80%,70%)',WebkitTextFillColor:'hsl(var(--theme-hue,250),80%,70%)'}}>{days}<span style={{fontSize:'0.5em',fontWeight:400,color:'hsl(var(--theme-hue,250),80%,70%)',WebkitTextFillColor:'hsl(var(--theme-hue,250),80%,70%)',opacity:0.65}}>天</span>{h}<span style={{fontSize:'0.5em',fontWeight:400,color:'hsl(var(--theme-hue,250),80%,70%)',WebkitTextFillColor:'hsl(var(--theme-hue,250),80%,70%)',opacity:0.65}}>时</span></span>;
}

/* ===== 实时时钟 — 含日期 ===== */
function LiveClock({ name }: { name: string }) {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const h = t.getHours();
  const g = h < 6 ? '🌙 夜深了' : h < 9 ? '☀️ 早上好' : h < 12 ? '🌤 上午好' : h < 14 ? '🔆 中午好' : h < 18 ? '🌈 下午好' : h < 22 ? '🌆 晚上好' : '🌙 夜深了';
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${t.getFullYear()}年${t.getMonth() + 1}月${t.getDate()}日 星期${weekdays[t.getDay()]}`;
  return <div className="text-center">
    <div className="hero-clock-display font-mono tabular-nums select-none">
      {String(h).padStart(2, '0')}<span className="text-white/20 mx-1">:</span>{String(t.getMinutes()).padStart(2, '0')}
    </div>
    <p className="hero-greeting">{g}，{name}</p>
    <p className="text-white/20 text-xs mt-1 font-light tracking-wider">{dateStr}</p>
  </div>;
}

export default function HomePage(){
  const{articles}=useArticles();const{user,siteOwnerDisplayName}=useAuth();
  const{search,setSearch,tagFilter,setTagFilter}=useSearchFilter();const nav=useNavigate();
  const isAdmin=user?.role==='admin';const[page,setPage]=useState(1);
  const[viewMode,setViewMode]=useState<'classic'|'cinema'|'album'>(()=>(localStorage.getItem('viewMode') as any)||'classic');

  const setMode=useCallback((m:'classic'|'cinema'|'album')=>{setViewMode(m);localStorage.setItem('viewMode',m)},[]);

  const filtered=useMemo(()=>{
    let l=[...articles].filter(a=>a?.id&&Array.isArray(a.tags));
    if(tagFilter)l=l.filter(a=>a.tags.includes(tagFilter));
    if(search.trim()){const q=search.toLowerCase();l=l.filter(a=>a.title.toLowerCase().includes(q)||a.summary.toLowerCase().includes(q)||a.tags.some(t=>t.toLowerCase().includes(q)))}
    l.sort((a,b)=>{if(a.pinned&&!b.pinned)return-1;if(!a.pinned&&b.pinned)return 1;return new Date(b.publishDate).getTime()-new Date(a.publishDate).getTime()});
    return l;
  },[articles,tagFilter,search]);

  const PP=12;const totalPages=Math.max(1,Math.ceil(filtered.length/PP));
  const allTags=useMemo(()=>[...new Set(articles.flatMap(a=>a.tags))].sort(),[articles]);
  const tc=useMemo(()=>articles.reduce((s,a)=>s+(a.contentLength||0),0),[articles]);
  useEffect(()=>{setPage(1);scrollTo(0,0)},[tagFilter,search]);

  const paged=useMemo(()=>filtered,[filtered]);
  const[featured,...rest]=paged;

  return<>
    <Helmet><title>{siteOwnerDisplayName}のblog</title></Helmet>

    {/* ===== HERO ===== */}
    <section className="hero-section">
      <div className="hero-bg"/><div className="hero-stars"/><div className="hero-accent-line"/>
      <div className="relative z-10">
        <LiveClock name={siteOwnerDisplayName}/>
        <div className="flex justify-center gap-2 sm:gap-4 mt-10 flex-wrap">
          {[{icon:FileText,label:'文章',v:articles.length},{icon:Tag,label:'标签',v:allTags.length},{icon:TrendingUp,label:'总字数',v:tc},{icon:Clock,label:'运行',v:0,rt:true}].map((s,i)=>s.rt?
            <div key={i} className="hero-stat text-center" style={{animationDelay:`${i*.1}s`}}>
              <div className="hero-stat-glow" />
              <div className="stat-number font-mono tabular-nums relative z-10"><RunningTime/></div>
              <div className="stat-label relative z-10">{s.label}</div>
            </div>:
            <div key={i} className="hero-stat text-center" style={{animationDelay:`${i*.1}s`}}>
              <div className="hero-stat-glow" />
              <div className="stat-number font-mono tabular-nums relative z-10"><AnimatedNumber value={s.v}/></div>
              <div className="stat-label relative z-10">{s.label}</div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0b] to-transparent pointer-events-none"/>
    </section>

    {/* ===== 文章区 ===== */}
    <section className="animate-slide-up">
      <header className="mb-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 tracking-tight">文章</h2>
            <p className="text-sm text-dark-500 mt-1">{filtered.length} 篇精选</p>
          </div>
          {isAdmin&&<Link to="/admin/publish" className="btn btn-primary text-sm"><Sparkles size={14}/>发布文章</Link>}
        </div>

        {/* 经典/影院/唱片 切换 */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-1 rounded-xl p-1">
            <button onClick={()=>setMode('classic')}
              className={`liquid-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode==='classic' ? 'active text-accent-400' : 'text-dark-500 hover:text-dark-700'}`}>
              <LayoutGrid size={12}/>经典
            </button>
            <button onClick={()=>setMode('cinema')}
              className={`liquid-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode==='cinema' ? 'active text-accent-400' : 'text-dark-500 hover:text-dark-700'}`}>
              <Film size={12}/>影院
            </button>
            <button onClick={()=>setMode('album')}
              className={`liquid-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode==='album' ? 'active text-accent-400' : 'text-dark-500 hover:text-dark-700'}`}>
              🎵唱片
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none"/><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索文章…" className="search-box"/></div>
          <TagFilter tags={allTags} activeTag={tagFilter} onTagChange={setTagFilter}/>
        </div>
      </header>

      {filtered.length===0?<div className="text-center py-20 text-dark-500"><p className="text-lg mb-2">没有匹配的文章</p></div>:
        viewMode==='cinema' ? <CinemaView articles={filtered} /> :
        viewMode==='album' ? <AlbumView articles={filtered} /> : <>
        <div className="article-grid-v2">
          {/* 特色文章 */}
          {featured&&<article className="featured-article card card-lift group cursor-pointer" onClick={()=>nav(`/article/${featured.id}`)}>
            <div className="featured-image">{featured.coverImage?<LazyImage src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover" fallback={featured.title.charAt(0)}/>:<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-500/10 to-accent-500/5"><span className="text-6xl font-bold text-white/5">{featured.title.charAt(0)}</span></div>}</div>
            <div className="featured-body">
              <span className="featured-badge"><TrendingUp size={11}/>精选</span>
              <div className="flex flex-wrap gap-1.5 mb-3">{featured.tags.slice(0,3).map(t=>{const c=tg(t);return<span key={t} className="text-[0.65rem] font-medium px-2 py-0.5 rounded-full" style={{background:c.bg,color:c.text}}>{t}</span>})}</div>
              <h3 className="text-xl font-bold text-dark-900 mb-2 leading-tight group-hover:text-accent-400 transition-colors">{featured.title}</h3>
              <p className="text-sm text-dark-500 line-clamp-2 mb-4 leading-relaxed">{featured.summary}</p>
              <div className="flex items-center gap-4 text-xs text-dark-500"><span className="inline-flex items-center gap-1"><Calendar size={11}/>{featured.publishDate}</span><span className="inline-flex items-center gap-1"><Clock size={11}/>{featured.readTime}分钟</span></div>
            </div>
          </article>}

          {/* 其余文章 */}
          {rest.map((a,i)=><article key={a.id} className="card card-lift group cursor-pointer overflow-hidden" style={{animationDelay:`${i*60}ms`}} onClick={()=>nav(`/article/${a.id}`)}>
            {a.coverImage?<div className="aspect-[16/9] overflow-hidden relative"><LazyImage src={a.coverImage} alt={a.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/><div className="card-shine absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"/>{a.pinned&&<span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6rem] font-semibold bg-accent-500/80 text-white backdrop-blur-sm"><Pin size={9}/>置顶</span>}</div>:<div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-white/[0.03] to-white/[0.01]"><span className="text-4xl font-bold text-white/5">{a.title.charAt(0)}</span></div>}
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2.5">{a.tags.slice(0,3).map(t=>{const c=tg(t);return<span key={t} className="text-[0.6rem] font-medium px-2 py-0.5 rounded-full" style={{background:c.bg,color:c.text}}>{t}</span>})}</div>
              <h3 className="text-sm font-semibold text-dark-900 mb-1.5 group-hover:text-accent-400 transition-colors line-clamp-2 leading-snug">{a.title}</h3>
              <p className="text-xs text-dark-500 line-clamp-2 mb-3">{a.summary}</p>
              <div className="flex items-center justify-between text-[0.65rem] text-dark-500">
                <span className="inline-flex items-center gap-1"><Calendar size={10}/>{a.publishDate}</span>
                <div className="flex items-center gap-1" onClick={e=>e.stopPropagation()}>{isAdmin&&<AdminArticleActions articleId={a.id} articleTitle={a.title} pinned={a.pinned} compact/>}<ChevronRight size={14} className="text-dark-400 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all"/></div>
              </div>
            </div>
          </article>)}
        </div>

        <div className="gradient-divider"/>

        {totalPages>1&&<nav className="flex items-center justify-center gap-2 mt-8">
          <button onClick={()=>{setPage(p=>Math.max(1,p-1));scrollTo(0,0)}} disabled={page<=1} className="px-4 py-2 rounded-xl text-sm text-dark-500 hover:bg-white/[0.04] disabled:opacity-20 transition-all">上一页</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>{setPage(p);scrollTo(0,0)}} className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p===page?'bg-white/[0.08] text-dark-900':'text-dark-500 hover:bg-white/[0.04]'}`}>{p}</button>)}
          <button onClick={()=>{setPage(p=>Math.min(totalPages,p+1));scrollTo(0,0)}} disabled={page>=totalPages} className="px-4 py-2 rounded-xl text-sm text-dark-500 hover:bg-white/[0.04] disabled:opacity-20 transition-all">下一页</button>
        </nav>}
      </>}
    </section>
  </>;
}
