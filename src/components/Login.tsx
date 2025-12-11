import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

export const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
           <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Bienvenue</h2>
        <p className="text-slate-600 mb-8">Connectez-vous pour accéder à votre espace de révision et sauvegarder vos progrès.</p>

        <button 
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow group"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google logo" />
          <span>Continuer avec Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            En continuant, vous acceptez d'utiliser cette application à des fins éducatives.
            <br/>Ceci est une simulation d'authentification.
          </p>
        </div>
      </div>
    </div>
  );
};