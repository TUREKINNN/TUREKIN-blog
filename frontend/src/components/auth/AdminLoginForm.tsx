import { useState, useCallback } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validatePassword, validateUsername } from '@/utils/auth';

interface AdminLoginFormProps {
  onSuccess: () => void;
}

export default function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const { loginAsAdmin, loginError, errorMessage, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const uErr = validateUsername(username);
    if (uErr) errors.username = uErr;
    const pErr = validatePassword(password, true);
    if (pErr) errors.password = pErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateFields()) return;

    setIsSubmitting(true);
    try {
      const success = await loginAsAdmin(username, password);
      if (success) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, validateFields, loginAsAdmin, clearError, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
        <Shield size={18} className="text-amber-500" />
        <span className="text-sm font-semibold text-apple-dark dark:text-white">
          管理员身份验证
        </span>
      </div>

      <div>
        <label htmlFor="admin-username" className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
          管理员账号
        </label>
        <input
          id="admin-username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearError();
            setFieldErrors((prev) => ({ ...prev, username: '' }));
          }}
          placeholder="输入管理员账号"
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
        <label htmlFor="admin-password" className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
          管理员密码
        </label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
              setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="输入管理员密码"
            autoComplete="current-password"
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
                   bg-gradient-to-r from-amber-500 to-orange-500
                   hover:from-amber-600 hover:to-orange-600
                   text-white
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200
                   flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            验证中...
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            管理员登录
          </>
        )}
      </button>

      <div className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray space-y-1">
        <p className="text-amber-600 dark:text-amber-400 font-medium">💡 管理员安全提示：</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>5 次连续登录失败将触发 60 秒账号锁定</li>
        </ul>
      </div>
    </form>
  );
}