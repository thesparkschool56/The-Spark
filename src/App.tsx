import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load page components
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const Fees = lazy(() => import('./pages/Fees'));
const Team = lazy(() => import('./pages/Team'));
const Examination = lazy(() => import('./pages/Examination'));
const Gallery = lazy(() => import('./pages/Gallery'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const CampusDashboard = lazy(() => import('./pages/CampusDashboard'));
const Admissions = lazy(() => import('./pages/Admissions'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminAdmissions = lazy(() => import('./pages/AdminAdmissions'));
const AdminFaculty = lazy(() => import('./pages/AdminFaculty'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const AdminFounders = lazy(() => import('./pages/AdminFounders'));
const Vacancies = lazy(() => import('./pages/Vacancies'));
const AdminVacancies = lazy(() => import('./pages/AdminVacancies'));
const AdminScoreboard = lazy(() => import('./pages/AdminScoreboard'));
const AdminCampuses = lazy(() => import('./pages/AdminCampuses'));
const AdminFees = lazy(() => import('./pages/AdminFees'));

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }

    // Dynamic Titles for SEO
    const titles: Record<string, string> = {
      '/': 'The Spark School & College | Igniting Minds, Shaping Futures',
      '/about': 'About Us | The Spark School & College',
      '/fees': 'Fee Structure | The Spark School & College',
      '/team': 'Our Team | The Spark School & College',
      '/examination': 'Examinations | The Spark School & College',
      '/gallery': 'Gallery | The Spark School & College',
      '/calendar': 'Events Calendar | The Spark School & College',
      '/admissions': 'Admissions 2024-25 | The Spark School & College',
      '/contact': 'Contact Us | The Spark School & College',
      '/login': 'Admin Login | The Spark School & College',
      '/admin': 'Admin Dashboard | The Spark School & College',
      '/vacancies': 'Vacant Positions | The Spark School & College'
    };

    const currentTitle = titles[pathname] || 'The Spark School & College';
    document.title = currentTitle;

  }, [pathname, hash]);

  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/team" element={<Team />} />
            <Route path="/examination" element={<Examination />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/campus/:slug" element={<CampusDashboard />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/vacancies" element={<Vacancies />} />
            <Route path="/login" element={<AdminLogin />} />
          </Route>

          {/* Admin Routes - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminScoreboard />} />
              <Route path="admissions" element={<AdminAdmissions />} />
              <Route path="faculty" element={<AdminFaculty />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="founders" element={<AdminFounders />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="vacancies" element={<AdminVacancies />} />
              <Route path="campuses" element={<AdminCampuses />} />
              <Route path="fees" element={<AdminFees />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
