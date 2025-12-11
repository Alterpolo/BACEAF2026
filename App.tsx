import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Methodology } from './components/Methodology';
import { Training } from './components/Training';
import { Program } from './components/Program';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Button } from './components/Button';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  );
};

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  
  if (!user) return <Link to="/login"><Button variant="primary">Connexion</Button></Link>;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
        <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
      </div>
      <button onClick={logout} className="text-xs text-slate-500 hover:text-red-600 underline">
        Déconnexion
      </button>
    </div>
  );
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
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
             <h3 className="font-bold text-lg group-hover:text-amber-700 transition-colors">Générateur de Sujets IA</h3>
          </div>
          <p className="text-sm text-slate-500 ml-14">Choisissez une œuvre, générez un sujet (ou une liste) et faites corriger votre plan par l'IA.</p>
        </Link>
        <Link to="/programme" className="block group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mr-4">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 flex items-center">
                    <span className="font-serif font-bold text-xl text-indigo-900">Bac Français</span>
                  </Link>
                  <nav className="hidden md:ml-8 md:flex md:space-x-4">
                    <NavLink to="/">Accueil</NavLink>
                    <NavLink to="/methodologie">Méthodologie</NavLink>
                    <NavLink to="/entrainement">Entraînement</NavLink>
                    <NavLink to="/programme">Programme</NavLink>
                  </nav>
                </div>
                <div className="flex items-center">
                  <UserMenu />
                </div>
              </div>
            </div>
            {/* Mobile Nav */}
            <div className="md:hidden flex justify-around p-2 bg-slate-50 text-xs border-t border-slate-100">
               <Link to="/" className="p-2">Accueil</Link>
               <Link to="/entrainement" className="p-2">Entraînement</Link>
               <Link to="/programme" className="p-2">Programme</Link>
            </div>
          </header>

          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/methodologie" element={<ProtectedRoute><Methodology /></ProtectedRoute>} />
              <Route path="/methodologie/:type" element={<ProtectedRoute><Methodology /></ProtectedRoute>} />
              <Route path="/entrainement" element={<ProtectedRoute><Training /></ProtectedRoute>} />
              <Route path="/programme" element={<ProtectedRoute><Program /></ProtectedRoute>} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
              <p>&copy; 2024 - Préparation EAF 2026. Conçu pour l'excellence académique.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;