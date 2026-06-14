import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleDate { id: number; title: string; date: string; }

interface MiniCalendarProps {
  articleData: ArticleDate[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function MiniCalendar({ articleData }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllMonth, setShowAllMonth] = useState(false);

  const dateMap = useMemo(() => {
    const map = new Map<string, ArticleDate[]>();
    articleData.forEach(a => {
      if (!map.has(a.date)) map.set(a.date, []);
      map.get(a.date)!.push(a);
    });
    return map;
  }, [articleData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const dateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  // 当月全部文章
  const monthArticles = useMemo(() => {
    return articleData.filter(a => a.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}-`));
  }, [articleData, year, month]);

  // 显示的文章列表
  const displayArticles = showAllMonth ? monthArticles : (selectedDate ? dateMap.get(selectedDate) || [] : []);

  const handleDateClick = (d: number) => {
    const ds = dateStr(d);
    if (ds === selectedDate && !showAllMonth) {
      // 第二次点同一日期 → 显示当月全部
      setShowAllMonth(true);
    } else if (ds === selectedDate && showAllMonth) {
      // 第三次点 → 取消
      setSelectedDate(null);
      setShowAllMonth(false);
    } else {
      // 第一次点 → 选中该日期
      setSelectedDate(ds);
      setShowAllMonth(false);
    }
  };

  const goMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta));
    setSelectedDate(null);
    setShowAllMonth(false);
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-dark-700">{year}年{month + 1}月</span>
        <div className="flex gap-0.5">
          <button onClick={() => goMonth(-1)} className="p-1 rounded-md hover:bg-white/[0.04] text-dark-500 transition-colors"><ChevronLeft size={13} /></button>
          <button onClick={() => goMonth(1)} className="p-1 rounded-md hover:bg-white/[0.04] text-dark-500 transition-colors"><ChevronRight size={13} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map(w => <div key={w} className="text-[0.6rem] font-medium text-dark-500 py-0.5">{w}</div>)}
        {days.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const ds = dateStr(d);
          const articles = dateMap.get(ds);
          const count = articles?.length || 0;
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          return (
            <button key={d} onClick={() => handleDateClick(d)}
              className={`relative w-7 h-7 rounded-lg text-[0.7rem] transition-all flex items-center justify-center font-mono
                ${isToday && !isSelected ? 'bg-accent-500/15 text-accent-400 font-bold' : ''}
                ${isSelected ? 'bg-accent-500/20 text-accent-400 ring-1 ring-accent-400/30' : ''}
                ${!isToday && !isSelected && count > 0 ? 'text-dark-700 font-semibold' : ''}
                ${!isToday && !isSelected && count === 0 ? 'text-dark-500' : ''}
                hover:bg-white/[0.06]`}>
              {d}
              {/* 文章计数角标 */}
              {count > 1 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[12px] h-[12px] rounded-full bg-accent-400 text-[0.45rem] font-bold text-white flex items-center justify-center leading-none px-0.5">
                  {count}
                </span>
              )}
              {/* 圆点标记 */}
              {count > 0 && (
                <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday || isSelected ? 'bg-accent-400' : 'bg-accent-400/60'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* 选中日期的文章列表 */}
      {displayArticles.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          {showAllMonth && (
            <div className="text-[0.6rem] text-dark-500 mb-2 px-1">
              📅 {year}年{month+1}月 · {displayArticles.length} 篇
            </div>
          )}
          {displayArticles.map(a => (
            <Link key={a.id} to={`/article/${a.id}`}
              className="block px-2 py-1.5 -mx-1 rounded-lg text-xs text-dark-700 hover:bg-white/[0.04] hover:text-dark-900 transition-colors truncate">
              · {a.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
