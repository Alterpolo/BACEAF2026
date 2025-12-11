import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BookOpen,
  GraduationCap,
  FileText,
  User,
  Users,
  Target,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NotificationBell } from "../Notifications";
import { getProfile, Profile } from "../../services/teacher";

const NavLink: React.FC<{
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      getProfile().then(setProfile);
    }
  }, [user]);

  const isTeacher = profile?.role === "teacher" || profile?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex-shrink-0 flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition-colors">
                  <span className="font-serif font-bold text-lg">B</span>
                </div>
                <span className="font-serif font-bold text-xl text-slate-800 tracking-tight hidden sm:block">
                  Bac Français 2026
                </span>
              </Link>
              <nav className="hidden md:ml-10 md:flex md:space-x-2">
                <NavLink to="/" icon={<BookOpen />}>
                  Accueil
                </NavLink>
                <NavLink to="/methodologie" icon={<FileText />}>
                  Méthodologie
                </NavLink>
                <NavLink to="/entrainement" icon={<GraduationCap />}>
                  Entraînement
                </NavLink>
                <NavLink to="/progression" icon={<Target />}>
                  Progression
                </NavLink>
                <NavLink to="/programme" icon={<BookOpen />}>
                  Programme
                </NavLink>
                <NavLink to="/tarifs" icon={<CreditCard />}>
                  Tarifs
                </NavLink>
                {isTeacher && (
                  <NavLink to="/enseignant" icon={<Users />}>
                    Espace Enseignant
                  </NavLink>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <NotificationBell />
                  <div className="hidden sm:flex items-center gap-3 ml-2">
                    <div className="text-right">
                      <span className="text-sm font-medium text-slate-700 block">
                        {user.name}
                      </span>
                      {isTeacher && (
                        <span className="text-xs text-indigo-600">
                          Enseignant
                        </span>
                      )}
                    </div>
                    <button
                      onClick={signOut}
                      className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200">
                    <User size={16} />
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Connexion
                </Link>
              )}
              <button
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/methodologie"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Méthodologie
              </Link>
              <Link
                to="/entrainement"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entraînement
              </Link>
              <Link
                to="/progression"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Progression
              </Link>
              <Link
                to="/programme"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Programme
              </Link>
              <Link
                to="/tarifs"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tarifs
              </Link>
              {isTeacher && (
                <Link
                  to="/enseignant"
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Espace Enseignant
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2025 - Préparation EAF 2026. Excellence Académique.</p>
        </div>
      </footer>
    </div>
  );
};
