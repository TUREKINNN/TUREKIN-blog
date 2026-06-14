import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-apple-dark dark:text-white mb-2">权限不足</h2>
        <p className="text-sm text-apple-gray dark:text-apple-dark-gray mb-6">
          您当前的账户权限无法访问此页面，请使用具有相应权限的账户登录
        </p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return <>{children}</>;
}