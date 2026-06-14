import { useState, useCallback, useRef } from 'react';
import { User, Eye, EyeOff, AlertTriangle, LogIn, Loader2, Upload, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validatePassword, validateUsername } from '@/utils/auth';

interface VisitorLoginFormProps {
  onSuccess: () => void;
}

export default function VisitorLoginForm({ onSuccess }: VisitorLoginFormProps) {
  const { loginAsVisitor, registerVisitor, loginError, errorMessage, clearError, updateAvatar, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const uErr = validateUsername(username);
    if (uErr) errors.username = uErr;
    const pErr = validatePassword(password, false);
    if (pErr) errors.password = pErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password]);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateAvatar(file);
  }, [updateAvatar]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateFields()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const success = await registerVisitor(username, password);
        if (success) {
          setRegisterSuccess(true);
          setMode('login');
        }
      } else {
        const success = await loginAsVisitor(username, password);
        if (success) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, mode, validateFields, loginAsVisitor, registerVisitor, clearError, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
        <User size={18} className="text-blue-500" />
        <span className="text-sm font-semibold text-apple-dark dark:text-white">
          {mode === 'login' ? '访客账户登录' : '注册新账户'}
        </span>
      </div>

      {registerSuccess && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <AlertTriangle size={16} className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" style={{ display: 'none' }} />
          <p className="text-sm text-green-600 dark:text-green-400">注册成功！请使用新账号登录。</p>
        </div>
      )}

      <div>
        <label htmlFor="visitor-username" className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
          用户名
        </label>
        <input
          id="visitor-username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearError();
            setFieldErrors((prev) => ({ ...prev, username: '' }));
            setRegisterSuccess(false);
          }}
          placeholder="输入用户名（3-30位字母、数字、下划线）"
          autoComplete="username"
          className={`w-full px-4 py-2.5 rounded-xl text-sm border transition-all duration-200 outline-none
                     bg-white dark:bg-gray-800
                     text-apple-dark dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     ${fieldErrors.username
                       ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500/20'
                       : 'border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                     }`}
        />
        {fieldErrors.username && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="visitor-password" className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
          密码
        </label>
        <div className="relative">
          <input
            id="visitor-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
              setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="输入密码（至少6位）"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm border transition-all duration-200 outline-none
                       bg-white dark:bg-gray-800
                       text-apple-dark dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       ${fieldErrors.password
                         ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500/20'
                         : 'border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                       }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>
        )}
      </div>

      {user && user.role !== 'guest' && (
        <div>
          <label className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
            个人头像
          </label>
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt="头像"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                         bg-gray-100 dark:bg-gray-800 text-apple-dark dark:text-white
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Upload size={14} />
              上传头像
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {loginError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle size={16} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 rounded-xl text-sm font-semibold
                   bg-gradient-to-r from-blue-500 to-blue-600
                   hover:from-blue-600 hover:to-blue-700
                   text-white
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200
                   flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            处理中...
          </>
        ) : mode === 'register' ? (
          <>
            <UserPlus size={16} />
            注册新账户
          </>
        ) : (
          <>
            <LogIn size={16} />
            访客登录
          </>
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); setRegisterSuccess(false); }}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {mode === 'login' ? '没有账户？点击注册' : '已有账户？返回登录'}
        </button>
      </div>

    </form>
  );
}