import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./library/pages/auth/LoginPage";
import DashboardPage from "./library/pages/dashboard/DashboardPage";
import ClientListPage from "./library/pages/clients/ClientListPage";
import AddClientPage from "./library/pages/clients/AddClientPage";
import ProductListPage from "./library/pages/products/ProductListPage";
import AddProductPage from "./library/pages/products/AddProductPage";
import CategoriesPage from "./library/pages/products/CategoriesPage";
import QuoteListPage from "./library/pages/quotes/QuoteListPage";
import AddQuotePage from "./library/pages/quotes/AddQuotePage";
import AddCalibrationPage from "./library/pages/calibrations/AddCalibrationPage";
import CalibrationHistoryPage from "./library/pages/calibrations/CalibrationHistoryPage";
import CertificationListPage from "./library/pages/certifications/CertificationListPage";
import GenerateCertificateFormPage from "./library/pages/certifications/GenerateCertificateFormPage";
import GenerateCertificatePreviewPage from "./library/pages/certifications/GenerateCertificatePreviewPage";
import BlogListPage from "./library/pages/blog/BlogListPage";
import AddBlogPage from "./library/pages/blog/AddBlogPage";
import SettingsPage from "./library/pages/settings/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientListPage />} />
        <Route path="/clients/add" element={<AddClientPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/products/categories" element={<CategoriesPage />} />
        <Route path="/quotes" element={<QuoteListPage />} />
        <Route path="/quotes/add" element={<AddQuotePage />} />
        <Route path="/calibrations/add" element={<AddCalibrationPage />} />
        <Route
          path="/calibrations/history"
          element={<CalibrationHistoryPage />}
        />
        <Route path="/certifications" element={<CertificationListPage />} />
        <Route
          path="/certifications/generate"
          element={<GenerateCertificateFormPage />}
        />
        <Route
          path="/certifications/generate/preview"
          element={<GenerateCertificatePreviewPage />}
        />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/add" element={<AddBlogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
