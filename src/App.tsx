import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Methodology } from "./components/Methodology";
import { Training } from "./components/Training";
import { Program } from "./components/Program";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { SkillProgression } from "./components/SkillProgression";
import { Pricing } from "./components/Pricing";
import { TutoringCalendar } from "./components/TutoringCalendar";
import { Onboarding } from "./components/Onboarding";
import { MentionsLegales, CGV, PolitiqueConfidentialite } from "./components/LegalPages";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { CookieConsentBanner } from "./components/ui/CookieConsent";

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; skipOnboarding?: boolean }> = ({
  children,
  skipOnboarding = false,
}) => {
  const { user, loading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if needed (unless we're already on onboarding or skipOnboarding is true)
  if (needsOnboarding && !skipOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Router>
              <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute skipOnboarding>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route path="/tarifs" element={<Pricing />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/methodologie"
                element={
                  <ProtectedRoute>
                    <Methodology />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/methodologie/:type"
                element={
                  <ProtectedRoute>
                    <Methodology />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entrainement"
                element={
                  <ProtectedRoute>
                    <Training />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/programme"
                element={
                  <ProtectedRoute>
                    <Program />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enseignant"
                element={
                  <ProtectedRoute>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progression"
                element={
                  <ProtectedRoute>
                    <SkillProgression />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cours"
                element={
                  <ProtectedRoute>
                    <TutoringCalendar />
                  </ProtectedRoute>
                }
              />
            </Routes>
              </Layout>
              <CookieConsentBanner />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
