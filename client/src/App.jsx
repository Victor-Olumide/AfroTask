import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PolicyPage from './pages/PolicyPage';
import TermsPage from './pages/TermsPage';
import FreelancersPage from './pages/FreelancersPage';

import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import FreelancerFeed from './pages/FreelancerFeed';
import ClientFeed from './pages/ClientFeed';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import ExploreJobs from './pages/ExploreJobs';
import ExploreProjects from './pages/ExploreProjects';
import ContactPage from './pages/ContactPage';
import MyApplications from './pages/MyApplications';
import CreatePost from './pages/CreatePost';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyProjects from './pages/MyProjects';
import WhatsAppBubble from './components/WhatsAppBubble';
import NotFound from './pages/NotFound';
import SearchResults from './pages/SearchResults';
import Blogs from './pages/Blogs';
import BlogPage from './pages/BlogPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MessagesPage from './pages/MessagesPage';
import PreProjectChat from './pages/PreProjectChat';
import FreelancerOnboarding from './pages/FreelancerOnboarding';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ClientOnboarding from './pages/ClientOnboarding';
import ProjectWorkspace from './pages/ProjectWorkspace';
import AppSettingsPage from './pages/AppSettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import BookmarksPage from './pages/BookmarksPage';

function App() {
  return (
    <div className='overflow-x-hidden'>
    <Router>
      <DarkModeProvider>
      <AuthProvider>
        <ScrollToTop />
        <Toaster position="top-right" />
        <WhatsAppBubble />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:blogId" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/explore-projects" element={<ExploreProjects />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Global Search Route */}
          <Route path="/search" element={
            <PrivateRoute>
              <SearchResults />
            </PrivateRoute>
          } />

          {/* App Settings Route */}
          <Route path="/settings" element={
            <PrivateRoute>
              <AppSettingsPage />
            </PrivateRoute>
          } />
          
          {/* Freelancers Directory */}
          <Route path="/freelancers" element={<FreelancersPage />} />

          {/* Onboarding Routes */}
          <Route path="/freelancer/onboarding" element={
            <PrivateRoute role="freelancer">
              <FreelancerOnboarding />
            </PrivateRoute>
          } />
          <Route path="/client/onboarding" element={
            <PrivateRoute role="client">
              <ClientOnboarding />
            </PrivateRoute>
          } />
          
          {/* Freelancer Routes */}
          <Route path="/freelancer/dashboard" element={
            <PrivateRoute role="freelancer">
              <FreelancerFeed />
            </PrivateRoute>
          } />
          <Route path="/freelancer/my-dashboard" element={
            <PrivateRoute role="freelancer">
              <FreelancerDashboard />
            </PrivateRoute>
          } />
          <Route path="/freelancer/feed" element={
            <PrivateRoute role="freelancer">
              <FreelancerFeed />
            </PrivateRoute>
          } />
          <Route path="/freelancer/jobs" element={
            <PrivateRoute role="freelancer">
              <ExploreJobs />
            </PrivateRoute>
          } />
          <Route path="/freelancer/applications" element={
            <PrivateRoute role="freelancer">
              <MyApplications />
            </PrivateRoute>
          } />
          <Route path="/freelancer/projects/:status" element={
            <PrivateRoute role="freelancer">
              <MyProjects />
            </PrivateRoute>
          } />
          <Route path="/freelancer/create-post" element={
            <PrivateRoute role="freelancer">
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/freelancer/profile" element={
            <PrivateRoute role="freelancer">
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/freelancer/messages" element={
            <PrivateRoute role="freelancer">
              <MessagesPage />
            </PrivateRoute>
          } />
          <Route path="/freelancer/bookmarks" element={
            <PrivateRoute role="freelancer">
              <BookmarksPage />
            </PrivateRoute>
          } />
          
          {/* Public Profile Route */}
          <Route path="/profile/:userId" element={
            <PrivateRoute>
              <PublicProfilePage />
            </PrivateRoute>
          } />

          {/* Admin Public Profile */}
          <Route path="/admin/profile/:userId" element={
            <PrivateRoute>
              <AdminProfilePage />
            </PrivateRoute>
          } />
          
          {/* Pre-Project Chat Route */}
          <Route path="/pre-project-chat/:applicationId" element={
            <PrivateRoute>
              <PreProjectChat />
            </PrivateRoute>
          } />
          
          {/* Project Workspace Route */}
          <Route path="/project/:projectId" element={
            <PrivateRoute>
              <ProjectWorkspace />
            </PrivateRoute>
          } />
          
          {/* Client Routes */}
          <Route path="/client/dashboard" element={
            <PrivateRoute role="client">
              <ClientFeed />
            </PrivateRoute>
          } />
          <Route path="/client/feed" element={
            <PrivateRoute role="client">
              <ClientFeed />
            </PrivateRoute>
          } />
          <Route path="/client/post-job" element={
            <PrivateRoute role="client">
              <PostJob />
            </PrivateRoute>
          } />
          <Route path="/client/create-post" element={
            <PrivateRoute role="client">
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/client/jobs" element={
            <PrivateRoute role="client">
              <MyJobs />
            </PrivateRoute>
          } />
          <Route path="/client/projects/:status" element={
            <PrivateRoute role="client">
              <MyProjects />
            </PrivateRoute>
          } />
          <Route path="/client/profile" element={
            <PrivateRoute role="client">
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/client/messages" element={
            <PrivateRoute role="client">
              <MessagesPage />
            </PrivateRoute>
          } />
          <Route path="/client/bookmarks" element={
            <PrivateRoute role="client">
              <BookmarksPage />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/dashboard/:tab" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/messages" element={
            <PrivateRoute role="admin">
              <MessagesPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
      </DarkModeProvider>
    </Router>
    </div>
  );
}

export default App;
