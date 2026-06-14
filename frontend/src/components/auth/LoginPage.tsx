import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { Shield, User, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLoginForm from './AdminLoginForm';
import VisitorLoginForm from './VisitorLoginForm';
import { useAuth } from '@/context/AuthContext';

type LoginTab = 'admin' | 'visitor' | 'guest';

export default function LoginPage() {
  const { isAuthenticated, user, isLoading, loginAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<LoginTab>('visitor');
  const [loggedIn, setLoggedIn] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  const handleGuestLogin = async () => {
    const success = await loginAsGuest();
    if (success) setLoggedIn(true);
  };

  return (
    <>
      <Helmet>
        <title>登录 - TUREKIN Blog</title>
        <meta name="description" content="登录TUREKIN技术博客，支持管理员、访客和游客三种登录方式" />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-apple-gray dark:text-apple-dark-gray hover:text-apple-dark dark:hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            返回首页
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-apple-dark dark:text-white mb-2">
              账户登录
            </h1>
            <p className="text-sm text-apple-gray dark:text-apple-dark-gray">
              选择登录方式以继续访问
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('visitor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 relative
                           ${activeTab === 'visitor'
                             ? 'text-blue-600 dark:text-blue-400'
                             : 'text-apple-gray dark:text-apple-dark-gray hover:text-apple-dark dark:hover:text-white'
                           }`}
              >
                <User size={16} />
                访客登录
                {activeTab === 'visitor' && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 relative
                           ${activeTab === 'admin'
                             ? 'text-amber-600 dark:text-amber-400'
                             : 'text-apple-gray dark:text-apple-dark-gray hover:text-apple-dark dark:hover:text-white'
                           }`}
              >
                <Shield size={16} />
                管理员登录
                {activeTab === 'admin' && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('guest')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 relative
                           ${activeTab === 'guest'
                             ? 'text-green-600 dark:text-green-400'
                             : 'text-apple-gray dark:text-apple-dark-gray hover:text-apple-dark dark:hover:text-white'
                           }`}
              >
                <Users size={16} />
                游客
                {activeTab === 'guest' && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-green-500 rounded-full" />
                )}
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {activeTab === 'admin' ? (
                <AdminLoginForm onSuccess={() => setLoggedIn(true)} />
              ) : activeTab === 'visitor' ? (
                <VisitorLoginForm onSuccess={() => setLoggedIn(true)} />
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <Users size={18} className="text-green-500" />
                    <span className="text-sm font-semibold text-apple-dark dark:text-white">
                      游客模式
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray dark:text-apple-dark-gray">
                    无需注册，点击下方按钮即可浏览和评论
                  </p>
                  <p className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray">
                    游客身份不会保留任何个人信息
                  </p>
                  <button
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-green-500 to-emerald-500
                               hover:from-green-600 hover:to-emerald-600
                               text-white
                               transition-all duration-200
                               flex items-center justify-center gap-2"
                  >
                    <Users size={16} />
                    以游客身份进入
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-apple-lightgray dark:text-apple-dark-lightgray mt-6">
            登录即表示您同意遵守本站的使用条款和隐私政策
          </p>
        </div>
      </div>
    </>
  );
}