import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/client';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Core Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { Organization } from './pages/Organization';
import { Subsidiaries } from './pages/Subsidiaries';
import { SubsidiaryDetail } from './pages/SubsidiaryDetail';
import { BusinessUnits } from './pages/BusinessUnits';
import { BusinessUnitDetail } from './pages/BusinessUnitDetail';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';

// ESG Data Pages
import { ESGDataCenter } from './pages/ESGDataCenter';
import { EnvironmentalHub } from './pages/EnvironmentalHub';
import { SocialHub } from './pages/SocialHub';
import { GovernanceHub } from './pages/GovernanceHub';

// BRSR Workspace Pages
import { BRSRWorkspace } from './pages/BRSRWorkspace';
import { BRSRSectionA } from './pages/BRSRSectionA';
import { BRSRSectionB } from './pages/BRSRSectionB';
import { BRSRSectionC } from './pages/BRSRSectionC';

// Validation & AI Anomalies
import { ValidationCenter } from './pages/ValidationCenter';
import { ValidationDetail } from './pages/ValidationDetail';
import { AIAnomalies } from './pages/AIAnomalies';

// Approvals & Reviews
import { ApprovalCenter } from './pages/ApprovalCenter';
import { ApprovalDetail } from './pages/ApprovalDetail';
import { ReviewCenter } from './pages/ReviewCenter';
import { ReviewSubmissionDetail } from './pages/ReviewSubmissionDetail';
import { CorrectionRequests } from './pages/CorrectionRequests';

// Analytics, SDGs, Reports, Audit
import { Analytics } from './pages/Analytics';
import { SDGMapping } from './pages/SDGMapping';
import { Reports } from './pages/Reports';
import { ReportDetail } from './pages/ReportDetail';
import { AuditTrail } from './pages/AuditTrail';

// System Pages
import { UsersRoles } from './pages/UsersRoles';
import { UserDetail } from './pages/UserDetail';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Route */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Navigate to="/login" replace />} />

                {/* Main Enterprise App Shell */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="executive-dashboard" element={<ExecutiveDashboard />} />

                  {/* Organization & Hierarchy */}
                  <Route path="organization" element={<Organization />} />
                  <Route path="organization/:id" element={<Organization />} />
                  <Route path="subsidiaries" element={<Subsidiaries />} />
                  <Route path="subsidiaries/:id" element={<SubsidiaryDetail />} />
                  <Route path="business-units" element={<BusinessUnits />} />
                  <Route path="business-units/:id" element={<BusinessUnitDetail />} />

                  {/* Projects & Deep Subroutes */}
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="projects/:id/overview" element={<ProjectDetail />} />
                  <Route path="projects/:id/review" element={<ProjectDetail />} />
                  <Route path="projects/:id/submissions" element={<ProjectDetail />} />
                  <Route path="projects/:id/esg" element={<ProjectDetail />} />
                  <Route path="projects/:id/esg/environmental" element={<ProjectDetail />} />
                  <Route path="projects/:id/esg/social" element={<ProjectDetail />} />
                  <Route path="projects/:id/esg/governance" element={<ProjectDetail />} />
                  <Route path="projects/:id/documents" element={<ProjectDetail />} />
                  <Route path="projects/:id/validation" element={<ProjectDetail />} />
                  <Route path="projects/:id/brsr" element={<ProjectDetail />} />
                  <Route path="projects/:id/approvals" element={<ProjectDetail />} />

                  {/* ESG Data Hub */}
                  <Route path="esg-data" element={<ESGDataCenter />} />
                  <Route path="environmental" element={<EnvironmentalHub />} />
                  <Route path="social" element={<SocialHub />} />
                  <Route path="governance" element={<GovernanceHub />} />

                  {/* BRSR Workspace */}
                  <Route path="brsr" element={<BRSRWorkspace />} />
                  <Route path="brsr/section-a" element={<BRSRSectionA />} />
                  <Route path="brsr/section-b" element={<BRSRSectionB />} />
                  <Route path="brsr/section-c" element={<BRSRSectionC />} />
                  <Route path="brsr/principles/:principleId" element={<BRSRSectionC />} />
                  <Route path="brsr/indicators/:indicatorId" element={<BRSRSectionC />} />

                  {/* Validation & AI Anomaly Detection */}
                  <Route path="validation" element={<ValidationCenter />} />
                  <Route path="validation/anomalies" element={<AIAnomalies />} />
                  <Route path="validation/:id" element={<ValidationDetail />} />

                  {/* Approval Center, Review Center & Correction Requests */}
                  <Route path="approvals" element={<ApprovalCenter />} />
                  <Route path="approvals/:id" element={<ApprovalDetail />} />
                  <Route path="review-center" element={<ReviewCenter />} />
                  <Route path="review-center/:submissionId" element={<ReviewSubmissionDetail />} />
                  <Route path="reviews" element={<ReviewCenter />} />
                  <Route path="reviews/:submissionId" element={<ReviewSubmissionDetail />} />
                  <Route path="correction-requests" element={<CorrectionRequests />} />
                  <Route path="consolidation" element={<Analytics />} />

                  {/* Analytics & Outputs */}
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="sdg-mapping" element={<SDGMapping />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="reports/:id" element={<ReportDetail />} />
                  <Route path="audit-trail" element={<AuditTrail />} />

                  {/* Users & Settings */}
                  <Route path="users" element={<UsersRoles />} />
                  <Route path="users/:id" element={<UserDetail />} />
                  <Route path="users-roles" element={<UsersRoles />} />
                  <Route path="settings" element={<Settings />} />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
