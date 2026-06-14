import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider as SiteThemeProvider } from '@/context/SiteThemeContext';
import { ArticleProvider } from '@/context/ArticleContext';
import { SearchFilterProvider } from '@/context/SearchFilterContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import LoadingSpinner from '@/components/LoadingSpinner';

const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PublishEditArticle = lazy(() => import('@/components/admin/PublishEditArticle'));
const LoginPage = lazy(() => import('@/components/auth/LoginPage'));
const AdminPanel = lazy(() => import('@/components/auth/AdminPanel'));
const FriendLinksPage = lazy(() => import('@/pages/FriendLinksPage'));
const ArchivePage = lazy(() => import('@/pages/ArchivePage'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <SiteThemeProvider>
      <ArticleProvider>
        <SearchFilterProvider>
            <Layout>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/article/:id" element={<ArticlePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/publish" element={<PublishEditArticle />} />
                  <Route path="/admin/edit/:id" element={<PublishEditArticle />} />
                  <Route path="/settings" element={<ProfilePage />} />
                  <Route path="/friends" element={<FriendLinksPage />} />
                  <Route path="/archive" element={<ArchivePage />} />
                </Routes>
              </Suspense>
            </Layout>
          </SearchFilterProvider>
      </ArticleProvider>
      </SiteThemeProvider>
    </AuthProvider>
  );
}