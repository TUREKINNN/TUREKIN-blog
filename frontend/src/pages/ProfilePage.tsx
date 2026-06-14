import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { User, Upload, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-dark-900 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500/40 transition-all";
const labelClass = "block text-sm font-medium text-dark-700 mb-1.5";

export default function ProfilePage() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isChangingPassword = !!password.trim();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChangingPassword && password !== passwordConfirm) { addToast('两次新密码不一致', 'error'); return; }
    if (isChangingPassword && !currentPassword.trim()) { addToast('请输入当前密码', 'error'); return; }
    setSubmitting(true);
    try {
      const ok = await updateProfile({
        username: username.trim() || undefined,
        displayName: displayName.trim() || undefined,
        password: password.trim() || undefined,
        currentPassword: currentPassword.trim() || undefined,
      });
      if (ok) {
        addToast('个人资料已更新', 'success');
        setPassword(''); setPasswordConfirm(''); setCurrentPassword('');
      } else {
        addToast('更新失败，请检查输入', 'error');
      }
    } catch { addToast('网络错误', 'error'); }
    finally { setSubmitting(false); }
  }, [displayName, username, password, passwordConfirm, currentPassword, isChangingPassword, updateProfile, addToast]);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('请选择图片文件', 'error'); return; }
    const ok = await updateAvatar(file);
    if (ok) addToast('头像已更新', 'success');
    else addToast('头像上传失败', 'error');
  }, [updateAvatar, addToast]);

  if (!user) { navigate('/login', { replace: true }); return null; }
  if (user.role === 'guest') { addToast('游客账户无法访问个人设置', 'error'); navigate('/', { replace: true }); return null; }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <Helmet><title>个人设置 - TUREKIN Blog</title></Helmet>

      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-dark-500 hover:text-dark-800 transition-colors mb-6">
        <ArrowLeft size={15} /> 返回
      </button>

      <h1 className="text-2xl font-bold text-dark-900 mb-8 tracking-tight">个人设置</h1>

      <div className="card p-6 space-y-6">
        {/* 用户信息头部 */}
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img src={user.avatar || '/avatar/user.png'} alt={user.displayName}
              className="w-20 h-20 rounded-2xl object-cover ring-1 ring-white/10"
              onError={(e) => { (e.target as HTMLImageElement).src = '/avatar/user.png'; }} />
            <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload size={20} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-dark-900 truncate">{user.displayName}</p>
            <p className="text-sm text-dark-500 truncate">@{user.username}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-500/15 text-accent-400">
              {user.role === 'admin' ? '管理员' : '访客'}
            </span>
          </div>
        </div>

        <hr className="border-white/[0.06]" />

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="pu">用户名</label>
            <input id="pu" type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder={user.username} maxLength={30} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pd">显示名称</label>
            <input id="pd" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder={user.displayName} maxLength={50} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pp">新密码（留空不修改）</label>
            <input id="pp" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="输入新密码" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pc">确认新密码</label>
            <input id="pc" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="再次输入新密码" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pcur">当前密码（验证身份）</label>
            <input id="pcur" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              placeholder="输入当前密码以确认" className={inputClass} />
          </div>

          <button type="submit" disabled={submitting}
            className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
            <Save size={15} />
            {submitting ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}
