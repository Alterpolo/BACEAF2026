import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { X, Cookie, Shield, BarChart3, Settings2 } from "lucide-react";

export interface CookiePreferences {
  essential: boolean; // Always true, can't be disabled
  analytics: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = "neodromes_cookie_consent";
const COOKIE_CONSENT_VERSION = "1"; // Bump this to re-ask users after policy changes

// Check if consent was previously given
function getStoredConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    // Check if version matches
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;

    return parsed.preferences;
  } catch {
    return null;
  }
}

// Store consent
function storeConsent(preferences: CookiePreferences): void {
  localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      version: COOKIE_CONSENT_VERSION,
      preferences,
      timestamp: new Date().toISOString(),
    })
  );
}

// Export for use in analytics/other services
export function getCookieConsent(): CookiePreferences {
  const stored = getStoredConsent();
  return stored || { essential: true, analytics: false, functional: false };
}

export function hasConsentedToAnalytics(): boolean {
  return getCookieConsent().analytics;
}

interface CookieConsentBannerProps {
  onConsent?: (preferences: CookiePreferences) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onConsent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: true,
  });

  useEffect(() => {
    // Check if consent was already given
    const storedConsent = getStoredConsent();
    if (!storedConsent) {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    // Apply stored preferences
    setPreferences(storedConsent);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
    };
    storeConsent(allAccepted);
    setPreferences(allAccepted);
    setIsVisible(false);
    onConsent?.(allAccepted);
  }, [onConsent]);

  const handleRejectNonEssential = useCallback(() => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
    };
    storeConsent(essentialOnly);
    setPreferences(essentialOnly);
    setIsVisible(false);
    onConsent?.(essentialOnly);
  }, [onConsent]);

  const handleSavePreferences = useCallback(() => {
    storeConsent(preferences);
    setIsVisible(false);
    onConsent?.(preferences);
  }, [preferences, onConsent]);

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Can't disable essential
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-slate-200 shadow-2xl animate-slide-up"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 id="cookie-banner-title" className="text-lg font-semibold text-slate-800">
                  Nous respectons votre vie privée
                </h2>
                <p id="cookie-banner-description" className="text-sm text-slate-600 mt-1">
                  Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez personnaliser vos préférences.{" "}
                  <Link to="/confidentialite" className="text-indigo-600 hover:underline">
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>

            {/* Detailed Settings */}
            {showDetails && (
              <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {/* Essential */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-800">Essentiels</p>
                      <p className="text-xs text-slate-500">Nécessaires au fonctionnement (authentification, sécurité)</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-500 mr-2">Toujours actif</span>
                    <div className="w-10 h-6 bg-green-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  </div>
                </div>

                {/* Functional */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">Fonctionnels</p>
                      <p className="text-xs text-slate-500">Mémorisent vos préférences (thème, langue)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("functional")}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.functional ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                    aria-pressed={preferences.functional}
                    aria-label="Activer les cookies fonctionnels"
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        preferences.functional ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-800">Analytiques</p>
                      <p className="text-xs text-slate-500">Nous aident à améliorer le service (anonymisés)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("analytics")}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.analytics ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                    aria-pressed={preferences.analytics}
                    aria-label="Activer les cookies analytiques"
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        preferences.analytics ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 lg:w-auto">
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Tout accepter
            </button>
            {showDetails ? (
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Personnaliser
              </button>
            )}
            <button
              onClick={handleRejectNonEssential}
              className="px-6 py-2.5 text-slate-500 text-sm hover:text-slate-700 transition-colors"
            >
              Refuser les non-essentiels
            </button>
          </div>
        </div>

        {/* Close button (always shows on mobile for accessibility) */}
        <button
          onClick={handleRejectNonEssential}
          className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// Hook to use cookie preferences in components
export function useCookieConsent(): CookiePreferences {
  const [consent, setConsent] = useState<CookiePreferences>(getCookieConsent);

  useEffect(() => {
    // Re-check on storage changes (for cross-tab sync)
    const handleStorageChange = () => {
      setConsent(getCookieConsent());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return consent;
}
