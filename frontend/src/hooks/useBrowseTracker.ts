import { useEffect, useRef, useCallback } from 'react';

interface BrowseReport {
  articleId: number;
  startTime: number;
  endTime: number;
  durationMs: number;
}

function sendBrowseReport(report: BrowseReport): void {
  if (report.durationMs < 500) return;
  navigator.sendBeacon
    ? navigator.sendBeacon('/api/browse', new Blob([JSON.stringify(report)], { type: 'application/json' }))
    : fetch('/api/browse', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
        keepalive: true,
      }).catch(() => {});
}

export function useBrowseTracker(articleId: number): { totalMs: number } {
  const startRef = useRef<number>(0);
  const totalRef = useRef<number>(0);
  const lastSyncRef = useRef<number>(0);

  const syncBrowse = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastSyncRef.current;
    if (elapsed < 2000) return;
    totalRef.current += elapsed;
    sendBrowseReport({
      articleId,
      startTime: lastSyncRef.current,
      endTime: now,
      durationMs: elapsed,
    });
    lastSyncRef.current = now;
  }, [articleId]);

  useEffect(() => {
    const el = document.getElementById('article-content');
    if (!el) return;

    startRef.current = Date.now();
    lastSyncRef.current = Date.now();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          lastSyncRef.current = Date.now();
        } else {
          syncBrowse();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);

    const interval = setInterval(syncBrowse, 5000);

    const handleBeforeUnload = () => {
      syncBrowse();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) syncBrowse();
      else lastSyncRef.current = Date.now();
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      syncBrowse();
    };
  }, [articleId, syncBrowse]);

  return { totalMs: totalRef.current };
}
