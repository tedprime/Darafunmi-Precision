import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./services/useToast";
import LoginPage from "./library/pages/auth/LoginPage";
import DashboardPage from "./library/pages/dashboard/DashboardPage";
import BookingListPage from "./library/pages/bookings/BookingListPage";
import QuoteRequestListPage from "./library/pages/quotes/QuoteRequestsListPage";
import ClientListPage from "./library/pages/clients/ClientListPage";
import AddClientPage from "./library/pages/clients/AddClientPage";
import EditClientPage from "./library/pages/clients/EditClientPage";
import ContactSubmissionsPage from "./library/pages/clients/ContactSubmissioinsPage";
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
import BlogListPage from "./library/pages/blog/BlogListPage";
import AddBlogPage from "./library/pages/blog/AddBlogPage";
import EditBlogPage from "./library/pages/blog/EditBlogPage";
import CaseStudyListPage from "./library/pages/caseStudy/CaseStudyListPage";
import AddCaseStudyPage from "./library/pages/caseStudy/AddCaseStudyPage";
import EditCaseStudyPage from "./library/pages/caseStudy/EditCaseStudyPage";
import SettingsPage from "./library/pages/settings/SettingsPage";
import OrderListPage from "./library/pages/orders/OrderListPage";
import SiteUserListPage from "./library/pages/siteUsers/siteUserListPage";
import SiteUserAuthPage from "./library/pages/siteUsers/siteUserAuthPage";
import ServiceListPage from "./library/pages/services/ServicesListPage";
import AddServicePage from "./library/pages/services/AddServicePage";
import EditServicePage from "./library/pages/services/EditServicePage";
import NewsletterListPage from "./library/pages/newsletter/NewsletterListPage";
import TeamListPage from "./library/pages/team/TeamListPage";
import AddTeamMemberPage from "./library/pages/team/AddTeamMemberPage";
import EditTeamMemberPage from "./library/pages/team/EditTeamMemberPage";
import { isAuthenticated } from "./services/auth.jsx";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Bookings */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingListPage />
              </ProtectedRoute>
            }
          />

          {/* Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderListPage />
              </ProtectedRoute>
            }
          />

          {/* Newsletter */}
          <Route
            path="/newsletter"
            element={
              <ProtectedRoute>
                <NewsletterListPage />
              </ProtectedRoute>
            }
          />
          {/* Clients */}
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
            path="/clients/contact-submissions"
            element={
              <ProtectedRoute>
                <ContactSubmissionsPage />
              </ProtectedRoute>
            }
          />

          {/* Site Users */}
          <Route
            path="/site-users"
            element={
              <ProtectedRoute>
                <SiteUserListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/site-users/auth"
            element={
              <ProtectedRoute>
                <SiteUserAuthPage />
              </ProtectedRoute>
            }
          />

          {/* Services */}
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServiceListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/add"
            element={
              <ProtectedRoute>
                <AddServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/edit/:id"
            element={
              <ProtectedRoute>
                <EditServicePage />
              </ProtectedRoute>
            }
          />

          {/* Products */}
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

          {/* Quotations */}
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
            path="/quotes/quote-requests"
            element={
              <ProtectedRoute>
                <QuoteRequestListPage />
              </ProtectedRoute>
            }
          />

          {/* Calibrations */}
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

          {/* Certifications */}
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

          {/* Content — Blog */}
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
            path="/blog/edit/:id"
            element={
              <ProtectedRoute>
                <EditBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <ProtectedRoute>
                <EditBlogPage />
              </ProtectedRoute>
            }
          />

          {/* Content — Case Studies */}
          <Route
            path="/case-studies"
            element={
              <ProtectedRoute>
                <CaseStudyListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/case-studies/add"
            element={
              <ProtectedRoute>
                <AddCaseStudyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/case-studies/edit/:id"
            element={
              <ProtectedRoute>
                <EditCaseStudyPage />
              </ProtectedRoute>
            }
          />
          {/* Teams */}
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/add"
            element={
              <ProtectedRoute>
                <AddTeamMemberPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/edit/:id"
            element={
              <ProtectedRoute>
                <EditTeamMemberPage />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
