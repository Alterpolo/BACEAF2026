import React, { useState } from 'react';
import { METHOD_DISSERTATION, METHOD_COMMENTAIRE } from '../constants';

export const Methodology: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dissert' | 'comment'>('dissert');

  const currentData = activeTab === 'dissert' ? METHOD_DISSERTATION : METHOD_COMMENTAIRE;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Méthodologie Officielle</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Maîtrisez les structures et les attentes de l'épreuve anticipée de français pour viser l'excellence.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('dissert')}
            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'dissert'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            La Dissertation
          </button>
          <button
            onClick={() => setActiveTab('comment')}
            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'comment'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Le Commentaire
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {currentData.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">{card.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{card.content}</p>
              
              {card.steps && (
                <div className="grid gap-4 md:grid-cols-2 bg-slate-50 p-4 rounded-lg">
                  {card.steps.map((step, sIdx) => (
                    <div key={sIdx} className="relative pl-4 border-l-2 border-indigo-300">
                      <h4 className="font-semibold text-slate-900 text-sm">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-100 rounded-lg p-6">
        <h3 className="text-amber-800 font-bold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Point de vigilance : La langue
        </h3>
        <p className="text-amber-800/80 text-sm">
          L'expression écrite est un critère discriminant. Gardez 10 minutes pour relire votre copie. 
          Proscrivez le "je" personnel, utilisez un vocabulaire précis, et soignez l'intégration des citations.
        </p>
      </div>
    </div>
  );
};