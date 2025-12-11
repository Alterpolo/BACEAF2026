import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Methodology } from './components/Methodology';
import { Training } from './components/Training';
import { Program } from './components/Program';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
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

const Dashboard: React.FC = () => (
  <div className="max-w-4xl mx-auto p-8 text-center space-y-12">
    <div className="space-y-4">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
        Excellence Bac Français
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Une plateforme dédiée à la maîtrise de la dissertation et du commentaire pour la session 2026.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      <Link to="/methodologie" className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <h3 className="font-bold text-lg mb-2">Méthodologie</h3>
        <p className="text-sm text-slate-500">Guides complets et structurés pour la dissertation et le commentaire.</p>
      </Link>

      <Link to="/entrainement" className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <h3 className="font-bold text-lg mb-2">Entraînement IA</h3>
        <p className="text-sm text-slate-500">Générez des sujets et obtenez une correction instantanée de vos plans.</p>
      </Link>

      <Link to="/programme" className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 className="font-bold text-lg mb-2">Programme 2026</h3>
        <p className="text-sm text-slate-500">La liste complète des œuvres et parcours associés.</p>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <span className="font-serif font-bold text-xl text-indigo-900">Bac Français</span>
                </Link>
                <nav className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  <NavLink to="/">Accueil</NavLink>
                  <NavLink to="/methodologie">Méthodologie</NavLink>
                  <NavLink to="/entrainement">Entraînement</NavLink>
                  <NavLink to="/programme">Programme</NavLink>
                </nav>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/methodologie" element={<Methodology />} />
            <Route path="/entrainement" element={<Training />} />
            <Route path="/programme" element={<Program />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            <p>&copy; 2024 - Préparation EAF 2026. Conçu pour l'excellence académique.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
