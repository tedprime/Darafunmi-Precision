import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import GenerateCertificatePreviewPage from "./library/pages/certifications/GenerateCertificatePreviewPage";
import BlogListPage from "./library/pages/blog/BlogListPage";
import AddBlogPage from "./library/pages/blog/AddBlogPage";
import SettingsPage from "./library/pages/settings/SettingsPage";

// New sections
// import OrderListPage from "./library/pages/orders/OrderListPage";
// import CartListPage from "./library/pages/orders/CartListPage";
import SiteUserListPage from "./library/pages/siteUsers/siteUserListPage";
import SiteUserAuthPage from "./library/pages/siteUsers/siteUserAuthPage";
import ServiceListPage from "./library/pages/services/ServicesListPage";
import AddServicePage from "./library/pages/services/AddServicePage";
import EditServicePage from "./library/pages/services/EditServicePage";
// import IndustryListPage from "./library/pages/industries/IndustryListPage";
// import AddIndustryPage from "./library/pages/industries/AddIndustryPage";
// import EditIndustryPage from "./library/pages/industries/EditIndustryPage";
// import CompanyCertificationListPage from "./library/pages/certifications/CompanyCertificationListPage";
// import CaseStudyListPage from "./library/pages/content/CaseStudyListPage";
// import AddCaseStudyPage from "./library/pages/content/AddCaseStudyPage";
// import EditCaseStudyPage from "./library/pages/content/EditCaseStudyPage";
// import TestimonialListPage from "./library/pages/content/TestimonialListPage";
// import AddTestimonialPage from "./library/pages/content/AddTestimonialPage";
// import EditTestimonialPage from "./library/pages/content/EditTestimonialPage";
// import ResourceListPage from "./library/pages/content/ResourceListPage";
// import AddResourcePage from "./library/pages/content/AddResourcePage";
// import EditResourcePage from "./library/pages/content/EditResourcePage";
// import NewsletterListPage from "./library/pages/newsletter/NewsletterListPage";

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
        {/* <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderListPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/orders/carts"
          element={
            <ProtectedRoute>
              <CartListPage />
            </ProtectedRoute>
          }
        /> */}

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

        {/* Industries */}
        {/* <Route
          path="/industries"
          element={
            <ProtectedRoute>
              <IndustryListPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/industries/add"
          element={
            <ProtectedRoute>
              <AddIndustryPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/industries/edit/:id"
          element={
            <ProtectedRoute>
              <EditIndustryPage />
            </ProtectedRoute>
          }
        /> */}

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
        <Route
          path="/certifications/generate/preview"
          element={
            <ProtectedRoute>
              <GenerateCertificatePreviewPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/certifications/company"
          element={
            <ProtectedRoute>
              <CompanyCertificationListPage />
            </ProtectedRoute>
          }
        /> */}

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

        {/* Content — Case Studies */}
        {/* <Route
          path="/content/case-studies"
          element={
            <ProtectedRoute>
              <CaseStudyListPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/content/case-studies/add"
          element={
            <ProtectedRoute>
              <AddCaseStudyPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/content/case-studies/edit/:id"
          element={
            <ProtectedRoute>
              <EditCaseStudyPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Content — Testimonials */}
        {/* <Route
          path="/content/testimonials"
          element={
            <ProtectedRoute>
              <TestimonialListPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/content/testimonials/add"
          element={
            <ProtectedRoute>
              <AddTestimonialPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/content/testimonials/edit/:id"
          element={
            <ProtectedRoute>
              <EditTestimonialPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Content — Resources */}
        {/* <Route
          path="/content/resources"
          element={
            <ProtectedRoute>
              <ResourceListPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/content/resources/add"
          element={
            <ProtectedRoute>
              <AddResourcePage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/content/resources/edit/:id"
          element={
            <ProtectedRoute>
              <EditResourcePage />
            </ProtectedRoute>
          }
        /> */}

        {/* Newsletter */}
        {/* <Route
          path="/newsletter"
          element={
            <ProtectedRoute>
              <NewsletterListPage />
            </ProtectedRoute>
          }
        /> */}

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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;