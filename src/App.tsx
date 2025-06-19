// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth'; // Ensure useAuth.tsx is correct

// Layout
import MainLayout from './components/layout/MainLayout'; // Assuming App.tsx is in src/

// Pages
import CalculatorPage from './pages/CalculatorPage';
import SignInPage from './pages/SignInPage';       
import SignUpPage from './pages/SignUpPage';       
import AdminDashboardPage from './pages/AdminDashboardPage'; 
import CustomerDashboardPage from './pages/CustomerDashboardPage'; // For Customer Dashboard
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // For Forgot Password
import NotFoundPage from './pages/NotFoundPage';
import {Toaster} from 'react-hot-toast';             // For 404
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import ContactUsPage from './pages/ContactUsPage';
import AboutUsPage from './pages/AboutUsPage';
import Upload from './pages/Upload';
import Onboarding from './pages/Onboarding';
import ExcelUploader from './pages/excel';
import AddTransporter from './pages/AddTransporter';
import AddPrice from './pages/AddPrices';
import PricingPage from './pages/PricingPage';

// PrivateRoute Component
interface PrivateRouteProps {
  children: React.ReactNode;
}
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // console.log("App.tsx - PrivateRoute check: isAuthenticated is:", isAuthenticated); // For debugging
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />; // Navigate to general sign-in
};

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/compare" replace /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider> {/* AuthProvider now wraps everything */}
      <Router>
        <Toaster />
        <Routes>
          {/* --- PROTECTED ROUTES (require login) --- */}
          <Route 
            path="/onboarding" 
            element={
              <MainLayout>
                  <Onboarding />
              </MainLayout>
            } 
          />
          <Route 
            path="/compare" 
            element={
              <MainLayout>
                <PrivateRoute>
                  <CalculatorPage />
                </PrivateRoute>
              </MainLayout>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <MainLayout>
                <PrivateRoute> {/* Assuming only authenticated users (admins) see this */}
                  <AdminDashboardPage />
                </PrivateRoute>
              </MainLayout>
            } 
          />
          <Route 
            path="/dashboard" // Example for Customer Dashboard
            element={
              <MainLayout>
                <PrivateRoute>
                  <CustomerDashboardPage />
                </PrivateRoute>
              </MainLayout>
            } 
          /> 

          <Route 
            path="/profile" // Example for Customer Dashboard
            element={
              <MainLayout>
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              </MainLayout>
            } 
          /> 

          {/* --- PUBLIC ROUTES --- */}
          
          <Route path="/signin" element={<MainLayout><PublicRoute><SignInPage /></PublicRoute></MainLayout>} />
          <Route path="/signup" element={<MainLayout><PublicRoute><SignUpPage /></PublicRoute></MainLayout>} />
          <Route path="/forgot-password" element={<MainLayout><PublicRoute><ForgotPasswordPage /></PublicRoute></MainLayout>} />
          <Route path='/' element={<LandingPage />} />
          <Route path="/excel" element={<MainLayout><ExcelUploader /></MainLayout>} />
          <Route path='/contact' element={<MainLayout><ContactUsPage /></MainLayout>} />
          <Route path='/about' element={<MainLayout><AboutUsPage /></MainLayout>} />
          <Route path='/upload' element={<MainLayout><Upload /></MainLayout>} />
          <Route path='/addtransporter' element={<MainLayout><AddTransporter /></MainLayout> }/>
          <Route path='/addprice' element={<MainLayout><AddPrice /></MainLayout> }/>
          <Route path='/pricing' element={<MainLayout><PricingPage /></MainLayout>} />
          
          {/* --- CATCH-ALL 404 ROUTE (MUST BE LAST) --- */}
          <Route 
            path="*" 
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;