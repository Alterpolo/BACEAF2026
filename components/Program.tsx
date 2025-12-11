import React from 'react';
import { PROGRAM_2026 } from '../constants';

export const Program: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 text-center">Programme 2026</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {PROGRAM_2026.map((genreGroup) => (
          <div key={genreGroup.genre} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">{genreGroup.genre}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {genreGroup.works.map((work, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <h4 className="font-serif font-bold text-lg text-indigo-900">{work.title}</h4>
                  <p className="text-slate-500 font-medium mb-2">{work.author}</p>
                  <div className="flex items-start">
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded mt-0.5 mr-2 shrink-0">Parcours</span>
                    <p className="text-sm text-slate-600 italic">"{work.parcours}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};