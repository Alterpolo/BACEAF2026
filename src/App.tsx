import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Methodology } from './components/Methodology';
import { Training } from './components/Training';
import { Program } from './components/Program';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Dashboard: React.FC = () => (
  <div className="max-w-5xl mx-auto p-8 text-center space-y-12 animate-fade-in">
    <div className="space-y-4">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
        Excellence Bac Français
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Une plateforme dédiée à la maîtrise de la dissertation et du commentaire pour la session 2026.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6 text-left">
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-slate-800 border-b border-slate-200 pb-2">Méthodologie</h2>
        <Link to="/methodologie/dissertation" className="block group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-4">
               <span className="font-serif font-bold">D</span>
             </div>
             <h3 className="font-bold text-lg group-hover:text-indigo-700 transition-colors">La Dissertation</h3>
          </div>
          <p className="text-sm text-slate-500 ml-14">Guide complet : analyse du sujet, problématique, plan dialectique et thématique.</p>
        </Link>
        <Link to="/methodologie/commentaire" className="block group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4">
               <span className="font-serif font-bold">C</span>
             </div>
             <h3 className="font-bold text-lg group-hover:text-emerald-700 transition-colors">Le Commentaire</h3>
          </div>
          <p className="text-sm text-slate-500 ml-14">Guide complet : lecture linéaire, procédés stylistiques et structure du devoir.</p>
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-slate-800 border-b border-slate-200 pb-2">Entraînement & Outils</h2>
        <Link to="/entrainement" className="block group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mr-4">
               <GraduationCap className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg group-hover:text-amber-700 transition-colors">Générateur de Sujets IA</h3>
          </div>
          <p className="text-sm text-slate-500 ml-14">Choisissez une œuvre, générez un sujet (ou une liste) et faites corriger votre plan par l'IA.</p>
        </Link>
        <Link to="/programme" className="block group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mr-4">
               <BookOpen className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg group-hover:text-slate-800 transition-colors">Programme Officiel 2026</h3>
          </div>
          <p className="text-sm text-slate-500 ml-14">Liste des œuvres et parcours : Roman, Poésie, Théâtre, Littérature d'idées.</p>
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/methodologie" element={<ProtectedRoute><Methodology /></ProtectedRoute>} />
            <Route path="/methodologie/:type" element={<ProtectedRoute><Methodology /></ProtectedRoute>} />
            <Route path="/entrainement" element={<ProtectedRoute><Training /></ProtectedRoute>} />
            <Route path="/programme" element={<ProtectedRoute><Program /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;