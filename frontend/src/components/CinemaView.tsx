import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Play, ChevronRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

interface Article { id: number; title: string; summary: string; coverImage: string | null; tags: string[]; publishDate: string; readTime: number; pinned?: boolean; }

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'React':{bg:'rgba(59,130,246,0.15)',text:'#93c5fd'},'TypeScript':{bg:'rgba(99,102,241,0.15)',text:'#a5b4fc'},
  'CSS':{bg:'rgba(236,72,153,0.15)',text:'#f9a8d4'},'前端':{bg:'rgba(34,197,94,0.15)',text:'#86efac'},
  'Hermes':{bg:'rgba(99,102,241,0.15)',text:'#a5b4fc'},'AI':{bg:'rgba(139,92,246,0.15)',text:'#c4b5fd'},
  '本周热点':{bg:'rgba(251,191,36,0.15)',text:'#fde68a'},'进化日记':{bg:'rgba(59,130,246,0.15)',text:'#93c5fd'},
};
function tg(tag:string){return TAG_COLORS[tag]||{bg:'rgba(255,255,255,0.06)',text:'#a1a1aa'}}

export default function CinemaView({ articles }: { articles: Article[] }) {
  const nav = useNavigate();
  const [featured, ...rest] = articles;

  return (
    <div className="animate-slide-up">
      {/* 正在上映 */}
      {featured && (
        <div onClick={() => nav(`/article/${featured.id}`)}
          className="relative overflow-hidden rounded-2xl cursor-pointer group mb-10 card-lift"
          style={{ minHeight: '420px' }}>
          {/* 全幅封面 */}
          <div className="absolute inset-0 bg-dark-200">
            {featured.coverImage ? (
              <img src={featured.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent-500/20 to-purple-900/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* 海报文字 */}
          <div className="relative z-10 flex flex-col justify-end h-full p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/80 text-white backdrop-blur-sm">
                <Play size={12} fill="currentColor" /> 正在上映
              </span>
              {featured.tags.slice(0,2).map(t => {
                const c = tg(t);
                return <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm" style={{background:c.bg,color:c.text}}>{t}</span>
              })}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-lg">{featured.title}</h2>
            <p className="text-sm text-white/70 line-clamp-2 mb-4 max-w-2xl leading-relaxed">{featured.summary}</p>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1"><Calendar size={12} />{featured.publishDate}</span>
              <span className="inline-flex items-center gap-1"><Clock size={12} />{featured.readTime} 分钟</span>
            </div>
          </div>
        </div>
      )}

      {/* 即将上映 / 更多文章 */}
      {rest.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-dark-500 uppercase tracking-widest mb-4">更多文章</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {rest.map((a, i) => (
              <div key={a.id} onClick={() => nav(`/article/${a.id}`)}
                className="card card-lift cursor-pointer overflow-hidden group"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="aspect-[2/3] relative bg-dark-200">
                  {a.coverImage ? (
                    <img src={a.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
                      <span className="text-5xl font-bold text-white/5">{a.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2 mb-1 drop-shadow-md">{a.title}</h4>
                    <span className="text-[0.6rem] text-white/50">{a.publishDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
