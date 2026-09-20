import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LegalDisclaimerPage } from './pages/LegalDisclaimerPage';

import { UploadDocumentPage } from './pages/UploadDocumentPage';
import { DocumentAnalysisPage } from './pages/DocumentAnalysisPage';
import { ClauseExplorerPage } from './pages/ClauseExplorerPage';
import { AskDocumentPage } from './pages/AskDocumentPage';
import { DocumentComparisonPage } from './pages/DocumentComparisonPage';
import { LegalTimelinePage } from './pages/LegalTimelinePage';
import { ActionChecklistPage } from './pages/ActionChecklistPage';
import { LawyerBriefPage } from './pages/LawyerBriefPage';
import { DocumentHistoryPage } from './pages/DocumentHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes with Navbar & Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/disclaimer" element={<LegalDisclaimerPage />} />
            </Route>

            {/* Protected Dashboard Routes with Sidebar & Header */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadDocumentPage />} />
                <Route path="/analysis" element={<DocumentAnalysisPage />} />
                <Route path="/clauses" element={<ClauseExplorerPage />} />
                <Route path="/ask" element={<AskDocumentPage />} />
                <Route path="/compare" element={<DocumentComparisonPage />} />
                <Route path="/timeline" element={<LegalTimelinePage />} />
                <Route path="/checklist" element={<ActionChecklistPage />} />
                <Route path="/brief" element={<LawyerBriefPage />} />
                <Route path="/history" element={<DocumentHistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
