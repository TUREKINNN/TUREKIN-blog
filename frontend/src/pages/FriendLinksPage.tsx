import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link2, ExternalLink, Copy, Check, Globe, Mail, Info, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FriendLink { id: number; name: string; url: string; avatarUrl: string; description: string; }

export default function FriendLinksPage() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [siteInfo, setSiteInfo] = useState({ name: 'TUREKINのblog', desc: '记录技术、生活与思考', avatar: '' });

  useEffect(() => {
    fetch('/api/config/about')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setSiteInfo({
            name: json.data?.siteName || 'TUREKINのblog',
            desc: json.data?.siteDesc || 'TUREKIN 的个人博客',
            avatar: json.data?.siteAvatar || 'https://www.turekin.me/avatar/user.png',
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/friendlinks', { credentials: 'include' })
      .then(r => r.json())
      .then(json => { if (json.success) setLinks(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyField = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
  }, []);

  const siteUrl = 'https://www.turekin.me';
  const contactEmail = 'turekin@qq.com';

  return <>
    <Helmet><title>友链 - TUREKIN Blog</title></Helmet>

    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-dark-800 transition-colors">
          <ArrowLeft size={15} /> 返回首页
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
          <Link2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dark-900">友链</h1>
          <p className="text-sm text-dark-500 mt-0.5">与有趣的灵魂交换链接</p>
        </div>
      </div>

      {/* 本站信息卡片 */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-1.5 mb-4">
          <Globe size={15} className="text-accent-400" />
          <h2 className="text-sm font-semibold text-dark-900">本站信息</h2>
        </div>
        <div className="space-y-2.5 text-sm">
          {[
            { label: '站点名称', value: siteInfo.name, key: 'name' },
            { label: '站点描述', value: siteInfo.desc, key: 'desc' },
            { label: '站点链接', value: siteUrl, key: 'url' },
            { label: '头像链接', value: siteInfo.avatar, key: 'avatar' },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center justify-between group">
              <span className="text-dark-500 w-20 flex-shrink-0">{label}</span>
              <code className="flex-1 text-dark-800 bg-white/[0.03] rounded-lg px-3 py-1.5 text-xs truncate mx-2 font-mono">{value}</code>
              <button onClick={() => copyField(value, key)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] text-dark-500 hover:text-accent-400 transition-all">
                {copied === key ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 已有友链 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={15} className="text-accent-400" />
          <h2 className="text-sm font-semibold text-dark-900">
            {loading ? '加载中...' : `${links.length} 位朋友`}
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1,2].map(i => <div key={i} className="card p-4 animate-pulse"><div className="skeleton h-12 w-12 rounded-xl mb-3"/><div className="skeleton h-4 w-24 rounded mb-2"/><div className="skeleton h-3 w-full rounded"/></div>)}
          </div>
        ) : links.length === 0 ? (
          <div className="card p-8 text-center text-dark-500">
            <Link2 size={28} className="mx-auto mb-3 text-dark-400" />
            <p className="text-sm">还没有友链，来做第一个朋友吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className="card card-lift p-4 flex items-start gap-3 group cursor-pointer hover:border-accent-400/20">
                <img src={link.avatarUrl || `${siteUrl}/avatar/user.png`} alt={link.name}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-dark-200"
                  onError={(e) => { (e.target as HTMLImageElement).src = `${siteUrl}/avatar/user.png`; }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-dark-900 text-sm truncate">{link.name}</span>
                    <ExternalLink size={11} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-xs text-dark-500 mt-1 line-clamp-2 leading-relaxed">{link.description || '暂无简介'}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 申请流程 */}
      <div className="card p-5 mb-3">
        <div className="flex items-center gap-1.5 mb-4">
          <Info size={15} className="text-accent-400" />
          <h2 className="text-sm font-semibold text-dark-900">如何申请友链</h2>
        </div>
        <div className="space-y-3 text-sm text-dark-700 leading-relaxed">
          {[
            { step: 1, title: '先添加本站链接', desc: '在你网站的友链区域添加本站信息（见上方卡片），确保链接可正常访问。' },
            { step: 2, title: '准备你的信息', desc: '收集你的站点名称、链接、头像链接、简短描述（20字以内）。' },
            { step: 3, title: '发送申请', desc: null, email: contactEmail },
          ].map(({ step, title, desc, email }) => (
            <div key={step} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500/15 text-accent-400 flex items-center justify-center text-xs font-bold">{step}</span>
              <div>
                <strong className="text-dark-900">{title}</strong>
                {desc && <br />}
                {desc && desc}
                {email && <><span className="text-dark-500">通过以下方式联系我：</span>
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-1 ml-1 text-accent-400 hover:text-accent-300 transition-colors">
                    <Mail size={12} /> {email}
                  </a></>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 注意事项 */}
      <div className="text-xs text-dark-500 space-y-1 px-1">
        <p>· 友链申请采用人工审核，通过后会在 48 小时内添加。</p>
        <p>· 请确保你的网站内容健康、无违法信息、长期稳定运行。</p>
        <p>· 本站会定期检查友链有效性，长时间失效的链接将被移除。</p>
        <p>· 如果你移除了本站链接，我也会相应移除友链哦。</p>
      </div>
    </div>
  </>;
}
