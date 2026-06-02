import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./library/pages/auth/LoginPage";
import DashboardPage from "./library/pages/dashboard/DashboardPage";
import ClientListPage from "./library/pages/clients/ClientListPage";
import AddClientPage from "./library/pages/clients/AddClientPage";
import EditClientPage from "./library/pages/clients/EditClientPage";
import ProductListPage from "./library/pages/products/ProductListPage";
import AddProductPage from "./library/pages/products/AddProductPage";
import EditProductPage from "./library/pages/products/EditProductPage";
import CategoriesPage from "./library/pages/products/CategoriesPage";
import QuoteListPage from "./library/pages/quotes/QuoteListPage";
import AddQuotePage from "./library/pages/quotes/AddQuotePage";
import EditQuotePage from "./library/pages/quotes/EditQuotePage";
import AddCalibrationPage from "./library/pages/calibrations/AddCalibrationPage";
import CalibrationHistoryPage from "./library/pages/calibrations/CalibrationHistoryPage";
import CertificationListPage from "./library/pages/certifications/CertificationListPage";
import GenerateCertificateFormPage from "./library/pages/certifications/GenerateCertificateFormPage";
import GenerateCertificatePreviewPage from "./library/pages/certifications/GenerateCertificatePreviewPage";
import BlogListPage from "./library/pages/blog/BlogListPage";
import AddBlogPage from "./library/pages/blog/AddBlogPage";
import SettingsPage from "./library/pages/settings/SettingsPage";
import { isAuthenticated } from "./services/auth.jsx";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/add"
          element={
            <ProtectedRoute>
              <AddClientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/edit/:id"
          element={
            <ProtectedRoute>
              <EditClientPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/add"
          element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/edit/:id"
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <QuoteListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/add"
          element={
            <ProtectedRoute>
              <AddQuotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/edit/:id"
          element={
            <ProtectedRoute>
              <EditQuotePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calibrations/add"
          element={
            <ProtectedRoute>
              <AddCalibrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calibrations/history"
          element={
            <ProtectedRoute>
              <CalibrationHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certifications"
          element={
            <ProtectedRoute>
              <CertificationListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certifications/generate"
          element={
            <ProtectedRoute>
              <GenerateCertificateFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certifications/generate/preview"
          element={
            <ProtectedRoute>
              <GenerateCertificatePreviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <BlogListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/add"
          element={
            <ProtectedRoute>
              <AddBlogPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
