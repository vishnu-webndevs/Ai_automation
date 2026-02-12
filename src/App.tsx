import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import Authentication from './pages/Authentication';

const RootRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    return user ? <Navigate to="/web-admin" replace /> : <Navigate to="/authentication" replace />;
};

// Lazy Load Admin Layout and Pages
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PageManager = lazy(() => import('./pages/PageManager'));
const PageGenerator = lazy(() => import('./pages/PageGenerator'));
const ServicesManager = lazy(() => import('./pages/ServicesManager'));
const IndustriesManager = lazy(() => import('./pages/IndustriesManager'));
const UseCasesManager = lazy(() => import('./pages/UseCasesManager'));
const BlogManager = lazy(() => import('./pages/BlogManager'));
const BlogCategoryManager = lazy(() => import('./pages/BlogCategoryManager'));
const BlogTagManager = lazy(() => import('./pages/BlogTagManager'));
const InternalLinkManager = lazy(() => import('./pages/InternalLinkManager'));
const RedirectManager = lazy(() => import('./pages/RedirectManager'));
const SchemaManager = lazy(() => import('./pages/SchemaManager'));
const SitemapManager = lazy(() => import('./pages/SitemapManager'));
const AuditLogViewer = lazy(() => import('./pages/AuditLogViewer'));
const CtaManager = lazy(() => import('./pages/CtaManager'));
const MenuManager = lazy(() => import('./pages/MenuManager'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const HopeUIKit = lazy(() => import('./pages/HopeUIKit'));
const StyleGuide = lazy(() => import('./pages/StyleGuide'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Verticals
const FintechDashboard = lazy(() => import('./pages/verticals/FintechDashboard'));
const AgriTechDashboard = lazy(() => import('./pages/verticals/AgriTechDashboard'));
const SystemStatus = lazy(() => import('./pages/verticals/SystemStatus'));

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/authentication" element={<Authentication />} />

        {/* Admin Routes - Prefixed with /web-admin */}
        <Route path="/web-admin" element={
            <ProtectedRoute>
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Admin Interface...</div>}>
                    <DashboardLayout />
                </Suspense>
            </ProtectedRoute>
        }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ui-kit" element={<HopeUIKit />} />
            <Route path="style-guide" element={<StyleGuide />} />
            <Route path="audit-logs" element={<AuditLogViewer />} />
            
            {/* Live Verticals */}
            <Route path="verticals/fintech" element={<FintechDashboard />} />
            <Route path="verticals/agritech" element={<AgriTechDashboard />} />
            <Route path="verticals/status" element={<SystemStatus />} />
            
            <Route element={<ProtectedRoute permission="manage_pages" />}>
                <Route path="pages" element={<PageManager />} />
            </Route>
            
            <Route element={<ProtectedRoute permission="generate_ai" />}>
                <Route path="ai-generator" element={<PageGenerator />} />
            </Route>

            {/* Taxonomy */}
            <Route element={<ProtectedRoute permission="manage_taxonomy" />}>
                <Route path="taxonomy/services" element={<ServicesManager />} />
                <Route path="taxonomy/industries" element={<IndustriesManager />} />
                <Route path="taxonomy/use-cases" element={<UseCasesManager />} />
            </Route>

            {/* Blog */}
            <Route element={<ProtectedRoute permission="manage_blog" />}>
                <Route path="blog/posts" element={<BlogManager />} />
                <Route path="blog/categories" element={<BlogCategoryManager />} />
                <Route path="blog/tags" element={<BlogTagManager />} />
            </Route>

            {/* SEO */}
            <Route element={<ProtectedRoute permission="manage_seo" />}>
                <Route path="seo/internal-links" element={<InternalLinkManager />} />
                <Route path="seo/redirects" element={<RedirectManager />} />
                <Route path="seo/schema" element={<SchemaManager />} />
                <Route path="seo/sitemap" element={<SitemapManager />} />
            </Route>

            {/* Other Modules */}
            <Route element={<ProtectedRoute permission="manage_ctas" />}>
                <Route path="ctas" element={<CtaManager />} />
            </Route>

            <Route element={<ProtectedRoute permission="manage_menus" />}>
                <Route path="menus" element={<MenuManager />} />
            </Route>

            <Route element={<ProtectedRoute permission="manage_media" />}>
                <Route path="media" element={<MediaLibrary />} />
            </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
