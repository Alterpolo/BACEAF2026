import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Methodology } from "./components/Methodology";
import { Training } from "./components/Training";
import { Program } from "./components/Program";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

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

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
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
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
