import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminGuard from './components/layout/AdminGuard';
import PageTransition from './components/ui/PageTransition';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Projects from './pages/public/Projects';
import ProjectDetail from './pages/public/ProjectDetail';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import Contact from './pages/public/Contact';
import Newsletter from './pages/public/Newsletter';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ProfileEditor from './pages/admin/ProfileEditor';
import ExperiencesManager from './pages/admin/ExperiencesManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import BlogManager, { BlogEditor } from './pages/admin/BlogManager';
import ContactsViewer from './pages/admin/ContactsViewer';
import NewsletterManager from './pages/admin/NewsletterManager';
import AnalyticsViewer from './pages/admin/AnalyticsViewer';

function NotFound() {
  return (
    <div className="section-container py-20 text-center">
      <h1 className="font-display font-extrabold text-7xl gradient-text mb-4">404</h1>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">Page not found.</p>
      <a href="/" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
        ← Go home
      </a>
    </div>
  );
}

// Wrap pages with transition animation
function P({ children }) {
  return <PageTransition>{children}</PageTransition>;
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route index element={<P><Home /></P>} />
          <Route path="about" element={<P><About /></P>} />
          <Route path="projects" element={<P><Projects /></P>} />
          <Route path="projects/:slug" element={<P><ProjectDetail /></P>} />
          <Route path="blog" element={<P><Blog /></P>} />
          <Route path="blog/:slug" element={<P><BlogPost /></P>} />
          <Route path="contact" element={<P><Contact /></P>} />
          <Route path="newsletter" element={<P><Newsletter /></P>} />
          <Route path="admin/login" element={<P><AdminLogin /></P>} />
          <Route path="*" element={<P><NotFound /></P>} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/profile" element={<ProfileEditor />} />
            <Route path="admin/experiences" element={<ExperiencesManager />} />
            <Route path="admin/projects" element={<ProjectsManager />} />
            <Route path="admin/projects/new" element={<ProjectsManager />} />
            <Route path="admin/blog" element={<BlogManager />} />
            <Route path="admin/blog/new" element={<BlogEditor />} />
            <Route path="admin/blog/:id" element={<BlogEditor />} />
            <Route path="admin/contacts" element={<ContactsViewer />} />
            <Route path="admin/newsletter" element={<NewsletterManager />} />
            <Route path="admin/analytics" element={<AnalyticsViewer />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
