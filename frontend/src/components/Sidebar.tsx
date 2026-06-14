import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, Home, User, LogIn, Shield, LogOut, Camera, Settings, Link2, ExternalLink, Palette, Heart, Calendar } from 'lucide-react';
import { useSearchFilter } from '@/context/SearchFilterContext';
import { useAuth } from '@/context/AuthContext';
import { useArticles } from '@/context/ArticleContext';
import { useSiteTheme, THEME_PRESETS, BG_PRESETS } from '@/context/SiteThemeContext';
import AvatarUploadModal from '@/components/AvatarUploadModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps { isMobileOpen: boolean; onMobileClose: () => void; }
interface FriendLink { id: number; name: string; url: string; avatarUrl: string; description: string; }

const navLinkClass = (active: boolean) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    active
      ? 'bg-white/[0.06] text-dark-900 dark:text-dark-900'
      : 'text-dark-500 dark:text-dark-500 hover:bg-white/[0.04] hover:text-dark-800 dark:hover:text-dark-800'
  }`;

const navLinkClassCollapsed = (active: boolean) =>
  `flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
    active
      ? 'bg-white/[0.06] text-dark-900 dark:text-dark-900'
      : 'text-dark-500 dark:text-dark-500 hover:bg-white/[0.04] hover:text-dark-800 dark:hover:text-dark-800'
  }`;

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { search, tagFilter, setSearch, setTagFilter } = useSearchFilter();
  const { isAuthenticated, user, siteOwnerAvatarCached, siteOwnerName, siteOwnerDisplayName, logout } = useAuth();
  const { articles } = useArticles();
  const { preset, setPreset, bgPreset, setBgPreset, bgPresets } = useSiteTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showBgPresets, setShowBgPresets] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [articleDates, setArticleDates] = useState<{id:number;title:string;date:string}[]>([]);

  useEffect(() => { fetch('/api/friendlinks', { credentials: 'include' }).then(r => r.json()).then(json => { if (json.success) setFriendLinks(json.data); }).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/config/about').then(r => r.json()).then(json => { if (json.data?.githubUrl) setGithubUrl(json.data.githubUrl); }).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/articles/dates').then(r => r.json()).then(json => { if (json.success) setArticleDates(json.data); }).catch(() => {}); }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setCollapsed(false);
  }, []);
  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setCollapsed(true), 80);
  }, []);
  const allTags = useMemo(() => Array.from(new Set(articles.flatMap(a => a.tags))).sort(), [articles]);
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Top: Avatar + Brand */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-14 h-14'}`}>
          <img src={siteOwnerAvatarCached} alt="站点管理员" className="w-full h-full object-cover" />
        </div>
        <Link to="/" onClick={onMobileClose}
          className={`font-bold text-dark-900 tracking-tight hover:opacity-80 transition-all duration-300 ${collapsed ? 'text-xs' : 'text-lg'}`}>
          {collapsed ? siteOwnerName : siteOwnerDisplayName}
        </Link>
        <button onClick={onMobileClose} className="lg:hidden absolute right-2 top-2 p-2 rounded-full text-dark-500 hover:text-dark-900 transition-colors" aria-label="关闭菜单">
          <X size={20} />
        </button>
      </div>

      {/* Middle: Search + Nav + Tags (expanded only or mobile) */}
      {(!collapsed || isMobileOpen) && (<>
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文章..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.06] text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-800 transition-colors"><X size={14} /></button>}
        </div>

        <nav className="space-y-1 mb-6">
          <Link to="/" onClick={onMobileClose} className={navLinkClass(isHome)}><Home size={17} />首页</Link>
          <Link to="/about" onClick={onMobileClose} className={navLinkClass(isAbout)}><User size={17} />关于</Link>
          <Link to="/friends" onClick={onMobileClose} className={navLinkClass(location.pathname === '/friends')}><Heart size={17} />友链</Link>
          {isAuthenticated && user?.role !== 'guest' && (
            <Link to="/settings" onClick={onMobileClose} className={navLinkClass(location.pathname === '/settings')}><Settings size={17} />个人设置</Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === '/admin' ? 'bg-accent-500/10 text-accent-400' : 'text-dark-500 hover:bg-accent-500/5 hover:text-accent-400'}`}>
              <Shield size={17} />管理面板
            </Link>
          )}
        </nav>

        <div className="mb-5">
          <h3 className="text-[0.65rem] font-semibold text-dark-500 uppercase tracking-widest mb-3 px-1">文章标签</h3>
          <TagsSection tags={allTags} articles={articles} tagFilter={tagFilter} setTagFilter={setTagFilter} collapsed={collapsed && !isMobileOpen} />
        </div>

        {/* 日历 + 归档 — 始终显示 */}
        {(!collapsed || isMobileOpen) && articleDates.length > 0 && (
          <div className="mb-5 px-1">
            <CalendarWidget articleData={articleDates} />
            <Link to="/archive"
              className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs text-dark-500 hover:bg-white/[0.04] transition-colors">
              <Calendar size={14} /> 文章归档
            </Link>
          </div>
        )}

        {/* 主题色 + 底色选择器 — 放这里避免误触退出 */}
        <div className="mb-5 px-1">
          <div className="flex items-center gap-2">
            {/* 主题色 */}
            <div className="relative flex-1">
              <button onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full text-xs text-dark-500 hover:bg-white/[0.04] transition-all">
                <div className="w-3.5 h-3.5 rounded-full" style={{background:`hsl(${preset.hue},${preset.saturation}%,${preset.lightness}%)`}}/>
                {!collapsed && <span>{preset.name}</span>}
              </button>
              {showPresets && (
                <div className="absolute bottom-full mb-1 left-0 bg-dark-100 border border-white/[0.08] rounded-xl p-1.5 shadow-xl z-50 flex gap-1">
                  {THEME_PRESETS.map(p => (
                    <button key={p.id} onClick={()=>{setPreset(p.id);setShowPresets(false)}}
                      className="w-6 h-6 rounded-full border-2 transition-all hover:scale-125"
                      style={{background:`hsl(${p.hue},${p.saturation}%,${p.lightness}%)`,borderColor:p.id===preset.id?'white':'transparent'}} title={p.name}/>
                  ))}
                </div>
              )}
            </div>
            {/* 底色 */}
            <div className="relative flex-1">
              <button onClick={() => setShowBgPresets(!showBgPresets)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full text-xs text-dark-500 hover:bg-white/[0.04] transition-all">
                <span className="text-[0.6rem]">🎨</span>
                {!collapsed && <span>{bgPreset.name}</span>}
              </button>
              {showBgPresets && (
                <div className="absolute bottom-full mb-1 left-0 bg-dark-100 border border-white/[0.08] rounded-xl p-2 shadow-xl z-50 min-w-[160px]">
                  {bgPresets.map(b => (
                    <button key={b.id} onClick={()=>{setBgPreset(b.id);setShowBgPresets(false)}}
                      className={`block w-full text-left px-2.5 py-1 rounded-lg text-xs transition-all ${b.id===bgPreset.id?'bg-white/[0.08] text-white':'text-dark-500 hover:bg-white/[0.04]'}`}>
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{background:`hsl(${b.hue},${b.hue===0?0:60}%,${b.hue===0?20:50}%)`}}/>
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {(friendLinks.length > 0 || githubUrl) && (
          <div className="mb-5 px-1">
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mb-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-dark-700 hover:text-dark-900 transition-colors group">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-xs font-medium">GitHub</span>
              </a>
            )}
            {friendLinks.length > 0 && (<>
              <h3 className="text-[0.65rem] font-semibold text-accent-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"><Link2 size={12} />友链</h3>
              <div className="space-y-0.5">
                {friendLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-dark-500 hover:bg-accent-500/5 hover:text-accent-400 transition-all group">
                    <img src={link.avatarUrl} alt={link.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0 bg-dark-200" loading="lazy" />
                    <span className="truncate flex-1">{link.name}</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </>)}
          </div>
        )}
      </>)}

      {/* Collapsed nav icons */}
      {collapsed && (
        <nav className="flex flex-col items-center gap-1 mb-auto">
          <Link to="/" onClick={onMobileClose} className={navLinkClassCollapsed(isHome)} aria-label="首页"><Home size={17} /></Link>
          <Link to="/about" onClick={onMobileClose} className={navLinkClassCollapsed(isAbout)} aria-label="关于"><User size={17} /></Link>
          <Link to="/friends" onClick={onMobileClose} className={navLinkClassCollapsed(location.pathname === '/friends')} aria-label="友链"><Heart size={17} /></Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" onClick={onMobileClose}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${location.pathname === '/admin' ? 'bg-accent-500/10 text-accent-400' : 'text-dark-500 hover:bg-accent-500/5 hover:text-accent-400'}`}
              aria-label="管理面板"><Shield size={17} /></Link>
          )}
          {isAuthenticated && user?.role !== 'guest' && (
            <Link to="/settings" onClick={onMobileClose} className={navLinkClassCollapsed(location.pathname === '/settings')} aria-label="个人设置"><Settings size={17} /></Link>
          )}
        </nav>
      )}

      {/* Bottom: User + Login/Logout + Theme */}
      <div className={`mt-auto pt-4 border-t border-white/[0.04] ${collapsed ? 'space-y-1.5' : 'space-y-1'}`}>
        {isAuthenticated ? (
          <div className={collapsed ? 'flex flex-col items-center gap-1.5' : 'space-y-1'}>
            <div className={`flex items-center ${collapsed ? 'flex-col gap-1.5' : 'gap-3 px-3 py-2 rounded-xl'}`}>
              <button onClick={() => { if (user?.role !== 'guest') setAvatarModalOpen(true); }}
                className={`relative group ${user?.role === 'guest' ? 'cursor-default' : 'cursor-pointer'}`}>
                <div className={`rounded-full overflow-hidden bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-9 h-9' : 'w-8 h-8'}`}>
                  <img src={user?.avatar || '/avatar/user.png'} alt={user?.displayName} className="w-full h-full object-cover" />
                </div>
                {user?.role !== 'guest' && (
                  <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={collapsed ? 11 : 12} className="text-white" />
                  </span>
                )}
              </button>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dark-900 truncate">{user?.displayName}</p>
                  <p className="text-[0.65rem] text-dark-500">{user?.role === 'admin' ? '管理员' : user?.role === 'guest' ? '游客' : '访客'}</p>
                </div>
              )}
            </div>
            {!collapsed ? (
              <button onClick={() => { logout(); onMobileClose(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-danger hover:bg-danger/5 transition-all">
                <LogOut size={17} />退出登录
              </button>
            ) : (
              <button onClick={() => { logout(); onMobileClose(); }}
                className="flex items-center justify-center w-9 h-9 rounded-full text-danger hover:bg-danger/5 transition-all" aria-label="退出登录">
                <LogOut size={17} />
              </button>
            )}
          </div>
        ) : (
          <Link to="/login" onClick={onMobileClose}
            className={collapsed
              ? 'flex items-center justify-center w-9 h-9 mx-auto rounded-full text-dark-500 hover:bg-white/[0.04] hover:text-dark-800 transition-all'
              : 'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-dark-500 hover:bg-white/[0.04] hover:text-dark-800 transition-all'}>
            <LogIn size={17} />{!collapsed && '登录'}
          </Link>
        )}

      </div>
    </div>
  );

  return (<>
    <aside ref={sidebarRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-[width] duration-200 ease-out glass-deep overflow-hidden ${collapsed ? 'w-16' : 'w-60 xl:w-64'}`}>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">{sidebarContent}</div>
    </aside>

    {isMobileOpen && (
      <div className="lg:hidden fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
        <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] glass-deep shadow-2xl animate-slide-up z-50">
          <div className="h-full overflow-y-auto p-5">{sidebarContent}</div>
        </aside>
      </div>
    )}

    {avatarModalOpen && <AvatarUploadModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} />}
  </>);
}

/* ===== 标签区组件 — 热门优先 + 折叠 ===== */
function TagsSection({ tags, articles, tagFilter, setTagFilter, collapsed }: {
  tags: string[]; articles: any[]; tagFilter: string | null;
  setTagFilter: (t: string | null) => void; collapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(a => a.tags?.forEach((t: string) => { counts[t] = (counts[t] || 0) + 1; }));
    return [...tags].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  }, [tags, articles]);
  const visible = expanded ? sorted : sorted.slice(0, collapsed ? 5 : 8);
  if (collapsed) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      <button onClick={() => setTagFilter(null)} className={`tag text-xs ${tagFilter === null ? 'active' : ''}`}>全部</button>
      {visible.map(tag => (
        <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? null : tag)} className={`tag text-xs ${tag === tagFilter ? 'active' : ''}`}>{tag}</button>
      ))}
      {sorted.length > visible.length && (
        <button onClick={() => setExpanded(!expanded)} className="tag text-xs text-dark-500 hover:text-dark-700">
          {expanded ? '收起' : `+${sorted.length - visible.length}更多`}
        </button>
      )}
    </div>
  );
}

/* ===== 日历组件 ===== */
function CalendarWidget({ articleData }: { articleData: { id: number; title: string; date: string }[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllMonth, setShowAllMonth] = useState(false);
  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

  const dateMap = useMemo(() => {
    const map = new Map<string, { id: number; title: string }[]>();
    articleData.forEach(a => {
      if (!map.has(a.date)) map.set(a.date, []);
      map.get(a.date)!.push({ id: a.id, title: a.title });
    });
    return map;
  }, [articleData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const dateStr = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const monthArticles = useMemo(() =>
    articleData.filter(a => a.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)),
    [articleData, year, month]);

  const displayArticles = showAllMonth ? monthArticles : (selectedDate ? dateMap.get(selectedDate) || [] : []);

  const handleClick = (d: number) => {
    const ds = dateStr(d);
    if (ds === selectedDate && !showAllMonth) setShowAllMonth(true);
    else if (ds === selectedDate && showAllMonth) { setSelectedDate(null); setShowAllMonth(false); }
    else { setSelectedDate(ds); setShowAllMonth(false); }
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-dark-700">{year}年{month+1}月</span>
        <div className="flex gap-0.5">
          <button onClick={() => { setCurrentDate(new Date(year, month-1)); setSelectedDate(null); setShowAllMonth(false); }}
            className="p-1 rounded-md hover:bg-white/[0.04] text-dark-500 transition-colors"><ChevronLeft size={13}/></button>
          <button onClick={() => { setCurrentDate(new Date(year, month+1)); setSelectedDate(null); setShowAllMonth(false); }}
            className="p-1 rounded-md hover:bg-white/[0.04] text-dark-500 transition-colors"><ChevronRight size={13}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map(w => <div key={w} className="text-[0.6rem] text-dark-500 py-0.5">{w}</div>)}
        {days.map((d, i) => {
          if (d === null) return <div key={`e${i}`}/>;
          const ds = dateStr(d), arts = dateMap.get(ds), count = arts?.length || 0;
          return (
            <button key={d} onClick={() => handleClick(d)}
              className={`relative w-7 h-7 rounded-lg text-[0.7rem] font-mono transition-all flex items-center justify-center
                ${ds === todayStr && ds !== selectedDate ? 'bg-accent-500/15 text-accent-400 font-bold' : ''}
                ${ds === selectedDate ? 'bg-accent-500/20 text-accent-400 ring-1 ring-accent-400/30' : ''}
                ${ds !== todayStr && ds !== selectedDate && count > 0 ? 'text-dark-700 font-semibold' : ''}
                ${count === 0 && ds !== todayStr ? 'text-dark-500' : ''} hover:bg-white/[0.06]`}>
              {d}
              {count > 1 && <span className="absolute -top-0.5 -right-0.5 min-w-[12px] h-[12px] rounded-full bg-accent-400 text-[0.45rem] font-bold text-white flex items-center justify-center leading-none px-0.5">{count}</span>}
              {count > 0 && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${ds === todayStr || ds === selectedDate ? 'bg-accent-400' : 'bg-accent-400/60'}`}/>}
            </button>
          );
        })}
      </div>
      {displayArticles.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/[0.04]">
          {showAllMonth && <div className="text-[0.6rem] text-dark-500 mb-1 px-1">{year}年{month+1}月 · {displayArticles.length} 篇</div>}
          {displayArticles.map(a => (
            <Link key={a.id} to={`/article/${a.id}`}
              className="block px-2 py-1 -mx-1 rounded text-xs text-dark-700 hover:bg-white/[0.04] hover:text-dark-900 transition-colors truncate">
              · {a.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
