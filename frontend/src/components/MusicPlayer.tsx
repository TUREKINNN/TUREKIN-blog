import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, ChevronUp, ChevronDown, Volume2 } from 'lucide-react';

interface Song {
  id: number; title: string; artist: string; audioUrl: string;
  coverUrl: string | null; duration: number;
}

// /uploads/ 路径通过 Nginx 代理到后端直接访问
function rewriteUrl(url: string | null): string | null {
  if (!url) return null;
  return url;
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem('music-volume');
    return v ? parseFloat(v) : 0.7;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化 Audio 对象 — 只跑一次
  if (!audioRef.current) {
    audioRef.current = new Audio();
  }
  const audio = audioRef.current;

  useEffect(() => {
    fetch('/api/music').then(r => r.json()).then(json => {
      if (json.success) setSongs(json.data);
    }).catch(() => {});
  }, []);

  // 音量
  useEffect(() => {
    audio.volume = volume;
    localStorage.setItem('music-volume', String(volume));
  }, [volume, audio]);

  const song = songs[current];

  // 切歌时加载新音源 — 不自动播放，只加载
  useEffect(() => {
    if (!song) return;
    const url = rewriteUrl(song.audioUrl);
    if (!url) return;
    audio.src = url;
    audio.load();
    // 如果正在播放，恢复播放
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, song?.id]);

  // 事件监听 — 用 onloadedmetadata / onended 更可靠
  useEffect(() => {
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || song?.duration || 0);
    const onEnd = () => {
      if (current < songs.length - 1) setCurrent(c => c + 1);
      else { setPlaying(false); setCurrent(0); }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, songs.length, song?.id]);

  // 用户点击切换播放/暂停 — 由用户手势触发，不会被 autoplay policy 拦截
  const togglePlay = useCallback(() => {
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {
        // 浏览器拦截了播放，回退
        setPlaying(false);
      });
    }
  }, [playing, audio]);

  const prev = useCallback(() => {
    setCurrent(c => c > 0 ? c - 1 : songs.length - 1);
  }, [songs.length]);

  const next = useCallback(() => {
    setCurrent(c => c < songs.length - 1 ? c + 1 : 0);
  }, [songs.length]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * (duration || 1);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audio, duration]);

  const seekVol = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, []);

  if (songs.length === 0) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };
  const coverUrl = rewriteUrl(song?.coverUrl || null);

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ isolation: 'isolate' }}>
      <div className={`transition-all duration-300 ${expanded ? 'w-72' : 'w-48'}`}>
        {/* 迷你条 */}
        {!expanded && (
          <button onClick={() => setExpanded(true)}
            className="glass-music flex items-center gap-2 px-3 py-2.5 rounded-xl hover:border-white/[0.15] transition-all w-full">
            {/* 小封面 */}
            {coverUrl ? (
              <img src={coverUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                <Music size={14} className="text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-medium text-white truncate">{song?.title || '未选择'}</p>
              <p className="text-[0.6rem] text-gray-300 truncate">{song?.artist}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="p-1.5 rounded-full bg-accent-400 text-white hover:bg-accent-500 transition-colors flex-shrink-0">
              {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </button>
          </button>
        )}

        {/* 展开面板 */}
        {expanded && (
          <div className="glass-music rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-semibold text-gray-300 uppercase tracking-wider">音乐</span>
              <button onClick={() => setExpanded(false)} className="p-1 rounded-md hover:bg-white/[0.08] text-gray-300 transition-colors">
                <ChevronDown size={14} />
              </button>
            </div>

            {/* 封面 + 信息 */}
            <div className="flex items-center gap-3 mb-3">
              {coverUrl ? (
                <img src={coverUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-400/30 to-accent-600/30 flex items-center justify-center flex-shrink-0">
                  <Music size={22} className="text-accent-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{song?.title || '—'}</p>
                <p className="text-xs text-gray-400 truncate">{song?.artist}</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-1.5 cursor-pointer" onClick={seek}>
              <div className="h-1 rounded-full bg-white/[0.1] overflow-hidden">
                <div className="h-full rounded-full bg-accent-400 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-[0.6rem] text-gray-400 mb-3">
              <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
            </div>

            {/* 控件 */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <button onClick={prev} className="p-1.5 text-gray-300 hover:text-white transition-colors"><SkipBack size={16} /></button>
              <button onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-accent-400 hover:bg-accent-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-accent-400/25">
                {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <button onClick={next} className="p-1.5 text-gray-300 hover:text-white transition-colors"><SkipForward size={16} /></button>
            </div>

            {/* 音量 */}
            <div className="flex items-center gap-2 mb-3">
              <Volume2 size={12} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 h-1 rounded-full bg-white/[0.1] cursor-pointer" onClick={seekVol}>
                <div className="h-full rounded-full bg-accent-400/60 transition-all" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>

            {/* 歌单 */}
            <div className="max-h-32 overflow-y-auto space-y-0.5">
              {songs.map((s, i) => (
                <button key={s.id} onClick={() => setCurrent(i)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${i === current ? 'bg-accent-500/15 text-accent-400' : 'text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'}`}>
                  <span className="truncate block">{s.title}</span>
                  <span className="text-[0.6rem] text-gray-500 truncate block">{s.artist}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}