import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import PageLoader from './components/PageLoader';
import { useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const Categories = lazy(() => import('./pages/Categories'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'));
const StaffDashboard = lazy(() => import('./dashboard/StaffDashboard'));
const ManageProducts = lazy(() => import('./dashboard/ManageProducts'));
const ManageOrders = lazy(() => import('./dashboard/ManageOrders'));
const ManageCategories = lazy(() => import('./dashboard/ManageCategories'));
const Inventory = lazy(() => import('./dashboard/Inventory'));
const Analytics = lazy(() => import('./dashboard/Analytics'));
const StaffManagement = lazy(() => import('./dashboard/StaffManagement'));
const UserManagement = lazy(() => import('./dashboard/UserManagement'));
const RevenueDashboard = lazy(() => import('./dashboard/RevenueDashboard'));

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: 'easeOut' }
};

function AnimatedPage({ children }) {
  return (
    <motion.div initial={pageTransition.initial} animate={pageTransition.animate} exit={pageTransition.exit} transition={pageTransition.transition}>
      {children}
    </motion.div>
  );
}

function RootRedirect() {
  const { role, loading, profileLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const isPublicView = new URLSearchParams(location.search).get('public') === '1';

  if (loading || (isAuthenticated && profileLoading)) {
    return <PageLoader />;
  }

  if (isPublicView) {
    return <AnimatedPage><Home /></AnimatedPage>;
  }

  if (isAuthenticated && (role === 'admin' || role === 'staff')) {
    return <Navigate to={role === 'staff' ? '/dashboard/staff' : '/dashboard/admin'} replace />;
  }

  return <AnimatedPage><Home /></AnimatedPage>;
}

function App() {
  const { role, loading, profileLoading, isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<RootRedirect />} />
            <Route path="menu" element={<AnimatedPage><Menu /></AnimatedPage>} />
            <Route path="categories" element={<AnimatedPage><Categories /></AnimatedPage>} />
            <Route path="product/:slug" element={<AnimatedPage><ProductDetails /></AnimatedPage>} />
            <Route path="about" element={<AnimatedPage><About /></AnimatedPage>} />
            <Route path="contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
            <Route path="cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
            <Route path="checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
            <Route path="track-order" element={<AnimatedPage><TrackOrder /></AnimatedPage>} />
            <Route path="track-order/:orderId" element={<AnimatedPage><TrackOrder /></AnimatedPage>} />
            <Route path="login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="register" element={<AnimatedPage><Register /></AnimatedPage>} />
            <Route path="profile" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute><AnimatedPage><OrderHistory /></AnimatedPage></ProtectedRoute>} />
          </Route>

          <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route
              index
              element={
                (loading || (isAuthenticated && profileLoading)) ? (
                  <PageLoader />
                ) : (
                  <Navigate to={role === 'staff' ? 'staff' : 'admin'} replace />
                )
              }
            />
            <Route path="admin" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><AdminDashboard /></AnimatedPage></RoleRoute>} />
            <Route path="staff" element={<RoleRoute allowedRoles={["staff", "admin"]}><AnimatedPage><StaffDashboard /></AnimatedPage></RoleRoute>} />
            <Route path="products" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><ManageProducts /></AnimatedPage></RoleRoute>} />
            <Route path="orders" element={<RoleRoute allowedRoles={["staff", "admin"]}><AnimatedPage><ManageOrders /></AnimatedPage></RoleRoute>} />
            <Route path="categories" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><ManageCategories /></AnimatedPage></RoleRoute>} />
            <Route path="inventory" element={<RoleRoute allowedRoles={["admin", "staff"]}><AnimatedPage><Inventory /></AnimatedPage></RoleRoute>} />
            <Route path="analytics" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><Analytics /></AnimatedPage></RoleRoute>} />
            <Route path="staff-management" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><StaffManagement /></AnimatedPage></RoleRoute>} />
            <Route path="users" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><UserManagement /></AnimatedPage></RoleRoute>} />
            <Route path="revenue" element={<RoleRoute allowedRoles={["admin"]}><AnimatedPage><RevenueDashboard /></AnimatedPage></RoleRoute>} />
          </Route>

          <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;