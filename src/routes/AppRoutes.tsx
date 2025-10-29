import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStaffPermissions } from '../hooks/useStaffPermissions';
import Layout from '../components/Layout/Layout';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import EnquiryList from '../pages/Enquiry/EnquiryList';
import EnquiryForm from '../pages/Enquiry/EnquiryForm';
import DocumentUpload from '../pages/Document/DocumentUpload';
import DocumentVerification from '../pages/Document/DocumentVerification';
import ShortlistList from '../pages/Shortlist/ShortlistList';
import ShortlistForm from '../pages/Shortlist/ShortlistForm';
import CashfreeList from '../pages/Cashfree/CashfreeList';
import CashfreeApplicationForm from '../pages/Cashfree/CashfreeApplicationForm';
import StaffManagement from '../pages/Staff/StaffManagement';
import TransactionList from '../pages/Transactions/TransactionList';
import TransactionForm from '../pages/Transactions/TransactionForm';
import LoanApplicationForm from '../pages/Apply/LoanApplicationForm';
import RefreshTestPage from '../pages/Testing/RefreshTestPage';
import LoginTest from '../pages/Testing/LoginTest';
function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();
  const { canManageStaff } = useStaffPermissions();

  // Show loading screen while authentication state is being restored
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes that don't require authentication
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/apply" element={<LoanApplicationForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login-test" element={<LoginTest />} />
      
      {/* Protected routes */}
      {isAuthenticated ? (
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/enquiries" element={<EnquiryList />} />
              <Route path="/enquiries/new" element={<EnquiryForm />} />
              <Route path="/enquiries/:id" element={<EnquiryForm />} />
              <Route path="/enquiries/:id/edit" element={<EnquiryForm />} />
              <Route path="/documents" element={<DocumentUpload />} />
              <Route path="/documents/verification" element={<DocumentVerification />} />
              
              {/* Routes accessible to both ADMIN and EMPLOYEE */}
              <Route path="/shortlist" element={<ShortlistList />} />
              <Route path="/shortlist/new" element={<ShortlistForm />} />
              <Route path="/shortlist/:id/edit" element={<ShortlistForm />} />
              <Route path="/payment-gateway" element={<CashfreeList />} />
              <Route path="/payment-gateway/apply/:id" element={<CashfreeApplicationForm />} />
              
              {/* Staff management route - only for admin@gmail.com */}
              {canManageStaff && (
                <Route path="/staff" element={<StaffManagement />} />
              )}
              
              {/* Admin-only routes */}
              {user?.role === 'ADMIN' && (
                <>
                  <Route path="/transactions" element={<TransactionList />} />
                  <Route path="/transactions/new" element={<TransactionForm />} />
                  <Route path="/transactions/:id/edit" element={<TransactionForm />} />
                  <Route path="/test-refresh" element={<RefreshTestPage />} />
                </>
              )}
              
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        } />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

export default AppRoutes;
