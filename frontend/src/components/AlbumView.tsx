import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Play } from 'lucide-react';

interface Article { id: number; title: string; summary: string; coverImage: string | null; tags: string[]; publishDate: string; readTime: number; }

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Hermes':{bg:'rgba(99,102,241,0.15)',text:'#a5b4fc'},'AI':{bg:'rgba(139,92,246,0.15)',text:'#c4b5fd'},
  '本周热点':{bg:'rgba(251,191,36,0.15)',text:'#fde68a'},'进化日记':{bg:'rgba(59,130,246,0.15)',text:'#93c5fd'},
};
function tg(tag:string){return TAG_COLORS[tag]||{bg:'rgba(255,255,255,0.06)',text:'#a1a1aa'}}

export default function AlbumView({ articles }: { articles: Article[] }) {
  const nav = useNavigate();

  return (
    <div className="animate-slide-up">
      {/* 专辑列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((a, i) => (
          <div key={a.id} onClick={() => nav(`/article/${a.id}`)}
            className="group cursor-pointer card card-lift overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}>
            {/* 唱片封面 */}
            <div className="relative aspect-square overflow-hidden bg-dark-200">
              {a.coverImage ? (
                <img src={a.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-500/20 to-purple-900/20 flex items-center justify-center">
                  <span className="text-7xl font-bold text-white/5">{a.title.charAt(0)}</span>
                </div>
              )}

              {/* 播放按钮覆盖层 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-accent-500/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-accent-500/30">
                  <Play size={22} className="text-white ml-1" fill="white" />
                </div>
              </div>

              {/* 唱片纹理装饰 */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            {/* 专辑信息 */}
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-dark-900 group-hover:text-accent-400 transition-colors line-clamp-1 leading-snug">{a.title}</h3>
                  <p className="text-xs text-dark-500 mt-1 line-clamp-1">{a.tags.slice(0,2).join(' · ') || '—'}</p>
                </div>
                <span className="text-[0.65rem] text-dark-500 flex-shrink-0 mt-0.5">{a.readTime}分</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[0.6rem] text-dark-500"><Calendar size={10} className="inline mr-1"/>{a.publishDate}</span>
                <div className="flex gap-1 flex-wrap">
                  {a.tags.slice(0,2).map(t => {
                    const c = tg(t);
                    return <span key={t} className="text-[0.55rem] px-1.5 py-0.5 rounded-full" style={{background:c.bg,color:c.text}}>{t}</span>;
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
