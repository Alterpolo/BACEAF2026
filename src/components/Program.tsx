import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PROGRAM_2026, WORKS_ANALYSIS_DB } from '../constants';
import { Genre, Work, WorkAnalysis } from '../types';
import { Button } from './Button';

export const Program: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  
  // Modal & Data State
  const [viewingWork, setViewingWork] = useState<Work | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'contexte' | 'personnages'>('resume');

  // Load analysis directly from memory (constants)
  const getAnalysis = (title: string): WorkAnalysis | null => {
    return WORKS_ANALYSIS_DB[title] || null;
  };

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenWork = (work: Work, triggerElement?: HTMLButtonElement) => {
    if (triggerElement) {
      triggerRef.current = triggerElement;
    }
    setViewingWork(work);
    setActiveTab('resume');
  };

  const closeWork = useCallback(() => {
    setViewingWork(null);
    // Return focus to trigger element
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  }, []);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!viewingWork) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWork();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element in modal
    setTimeout(() => {
      const closeButton = modalRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Fermer"]');
      closeButton?.focus();
    }, 100);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewingWork, closeWork]);

  const getShortLabel = (genre: Genre) => {
    if (genre.includes('Roman')) return 'Roman';
    if (genre.includes('Poésie')) return 'Poésie';
    if (genre.includes('Théâtre')) return 'Théâtre';
    if (genre.includes('idées')) return 'Idées';
    return genre;
  };

  const getGenreColor = (genre: Genre) => {
    if (genre.includes('Roman')) return 'amber';
    if (genre.includes('Poésie')) return 'pink';
    if (genre.includes('Théâtre')) return 'indigo';
    return 'emerald'; // Idées
  };

  const filteredProgram = selectedGenre 
    ? PROGRAM_2026.filter(group => group.genre === selectedGenre)
    : PROGRAM_2026;

  const currentAnalysis = viewingWork ? getAnalysis(viewingWork.title) : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Programme Officiel 2026</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Accédez aux fiches de révision détaillées pour les 12 œuvres au programme :<br/>
          Résumés, contextes historiques, biographies et analyses des personnages.
        </p>
      </div>
      
      {/* Filter Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-16 sticky top-20 z-30 py-2 bg-slate-50/90 backdrop-blur-sm transition-all">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
            selectedGenre === null
              ? 'bg-slate-800 text-white ring-2 ring-slate-800 ring-offset-2 scale-105'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Tout le programme
        </button>
        {Object.values(Genre).map((genre) => {
          const color = getGenreColor(genre);
          const isSelected = selectedGenre === genre;
          // Dynamic styles based on color logic
          let activeStyle = "";
          if (color === 'amber') activeStyle = "bg-amber-600 text-white ring-amber-600";
          if (color === 'pink') activeStyle = "bg-pink-600 text-white ring-pink-600";
          if (color === 'indigo') activeStyle = "bg-indigo-600 text-white ring-indigo-600";
          if (color === 'emerald') activeStyle = "bg-emerald-600 text-white ring-emerald-600";

          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                isSelected
                  ? `${activeStyle} ring-2 ring-offset-2 scale-105`
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {getShortLabel(genre)}
            </button>
          );
        })}
      </div>

      <div className="space-y-16">
        {filteredProgram.map((genreGroup) => {
           const genreColor = getGenreColor(genreGroup.genre);
           const titleColorClass = 
             genreColor === 'amber' ? 'text-amber-800 border-amber-200 bg-amber-50' :
             genreColor === 'pink' ? 'text-pink-800 border-pink-200 bg-pink-50' :
             genreColor === 'indigo' ? 'text-indigo-800 border-indigo-200 bg-indigo-50' :
             'text-emerald-800 border-emerald-200 bg-emerald-50';

           const icon = 
             genreColor === 'amber' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> :
             genreColor === 'pink' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> :
             genreColor === 'indigo' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> :
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

          return (
            <section key={genreGroup.genre} className="animate-fade-in">
              <div className={`flex items-center gap-3 border-b-2 pb-3 mb-8 ${titleColorClass.split(' ')[1]}`}>
                <div className={`p-2 rounded-lg ${titleColorClass.split(' ')[2]} ${titleColorClass.split(' ')[0]}`}>
                  {icon}
                </div>
                <h3 className={`text-2xl font-serif font-bold ${titleColorClass.split(' ')[0]}`}>
                  {genreGroup.genre}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {genreGroup.works.map((work, idx) => (
                  <button
                    key={idx}
                    role="listitem"
                    className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={(e) => handleOpenWork(work, e.currentTarget)}
                    aria-label={`Voir la fiche de ${work.title} par ${work.author}`}
                  >
                    <div className={`h-2 w-full ${
                      genreColor === 'amber' ? 'bg-amber-500' :
                      genreColor === 'pink' ? 'bg-pink-500' :
                      genreColor === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`}></div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-4">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{work.author}</p>
                        <h4 className="font-serif font-bold text-xl text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                          {work.title}
                        </h4>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                          <span className="not-italic font-bold text-xs text-slate-400 block mb-1">PARCOURS</span>
                          "{work.parcours}"
                        </div>
                        <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0" aria-hidden="true">
                           Voir la fiche complète
                           <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Modal Overlay */}
      {viewingWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeWork}
            aria-hidden="true"
          ></div>
          <div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in ring-1 ring-white/20"
          >
            
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 p-6 md:p-8 flex justify-between items-start shrink-0 z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">Fiche de Révision</span>
                </div>
                <h3 id="modal-title" className="text-3xl md:text-4xl font-serif font-bold text-slate-900">{viewingWork.title}</h3>
                <p className="text-slate-500 text-xl mt-1 font-medium">{viewingWork.author}</p>
              </div>
              <button 
                onClick={closeWork} 
                className="group p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-8 h-8 text-slate-400 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-hidden flex flex-col md:flex-row bg-slate-50">
              {!currentAnalysis ? (
                <div className="flex flex-col items-center justify-center w-full h-64 space-y-4 text-center p-8">
                   <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                   </div>
                   <p className="text-slate-600 font-medium text-lg">Recherche des informations dans la base de données...</p>
                   <Button onClick={closeWork} variant="outline">Fermer</Button>
                </div>
              ) : (
                <>
                  {/* Sidebar Navigation */}
                  <div className="w-full md:w-72 bg-white border-r border-slate-200 flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-visible shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
                     <button 
                      onClick={() => setActiveTab('resume')}
                      className={`flex-1 md:flex-none p-5 text-left font-bold border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === 'resume' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                     >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       Résumé Détaillé
                     </button>
                     <button 
                      onClick={() => setActiveTab('contexte')}
                      className={`flex-1 md:flex-none p-5 text-left font-bold border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === 'contexte' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                     >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       Contexte & Bio
                     </button>
                     <button 
                      onClick={() => setActiveTab('personnages')}
                      className={`flex-1 md:flex-none p-5 text-left font-bold border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === 'personnages' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                     >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       Personnages Clés
                     </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                    {activeTab === 'resume' && (
                      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                           <p className="text-indigo-800 text-sm font-medium flex items-center">
                             <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             Ce résumé suit la progression de l'œuvre pour faciliter vos révisions linéaires.
                           </p>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-300 before:to-slate-200">
                          {currentAnalysis.summary.map((part, i) => (
                            <div key={i} className="relative flex items-start group is-active">
                              <div className="absolute top-0 left-0 mt-1 ml-5 -translate-x-1/2 md:ml-0 md:translate-x-0 md:relative w-4 h-4 rounded-full border-2 border-indigo-600 bg-white group-hover:bg-indigo-600 transition-colors z-10 shrink-0 shadow-sm"></div>
                              <div className="ml-10 md:ml-8 w-full">
                                <h5 className="font-bold text-lg text-indigo-900 mb-3 flex items-center">
                                  {part.partTitle}
                                </h5>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-slate-700 leading-relaxed hover:border-indigo-200 transition-colors">
                                  {part.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'contexte' && (
                      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center">
                            <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mr-3">Bio</span>
                            <h4 className="text-lg font-bold text-slate-800">L'Auteur</h4>
                          </div>
                          <div className="p-8 text-slate-700 leading-relaxed text-lg">
                            {currentAnalysis.biography}
                          </div>
                        </div>

                        <div className="bg-indigo-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                          <div className="bg-indigo-100/50 px-6 py-4 border-b border-indigo-100 flex items-center">
                             <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mr-3">Contexte</span>
                             <h4 className="text-lg font-bold text-indigo-900">Genèse de l'œuvre</h4>
                          </div>
                          <div className="p-8 text-indigo-900 leading-relaxed text-lg">
                            {currentAnalysis.context}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'personnages' && (
                      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                         <div className="text-center mb-8">
                            <h4 className="text-2xl font-serif font-bold text-slate-800">Galerie des Personnages & Thèmes</h4>
                            <p className="text-slate-500 mt-2">Les figures clés pour comprendre les enjeux.</p>
                         </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                          {currentAnalysis.characters.map((char, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                              <h5 className="font-bold text-xl text-slate-900 mb-3 pl-3">{char.name}</h5>
                              <p className="text-slate-600 leading-relaxed pl-3 border-t border-slate-100 pt-3">{char.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};