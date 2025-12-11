import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { METHOD_DISSERTATION, METHOD_COMMENTAIRE } from '../constants';
import { Button } from './Button';

const MethodDetail: React.FC<{ type: 'dissertation' | 'commentaire' }> = ({ type }) => {
  const data = type === 'dissertation' ? METHOD_DISSERTATION : METHOD_COMMENTAIRE;
  const title = type === 'dissertation' ? "La Dissertation" : "Le Commentaire";
  const color = type === 'dissertation' ? "indigo" : "emerald";

  // Dynamic class names for colors
  const bgSoft = type === 'dissertation' ? "bg-indigo-50" : "bg-emerald-50";
  const borderSoft = type === 'dissertation' ? "border-indigo-100" : "border-emerald-100";
  const textDark = type === 'dissertation' ? "text-indigo-900" : "text-emerald-900";
  const borderLeft = type === 'dissertation' ? "border-indigo-400" : "border-emerald-400";

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className={`text-3xl font-serif font-bold ${textDark}`}>{title} : Méthode Complète</h2>
        <Link to="/methodologie">
          <Button variant="outline">Retour</Button>
        </Link>
      </div>

      <div className="grid gap-8">
        {data.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`p-6 border-b ${borderSoft} ${bgSoft}`}>
              <h3 className={`text-xl font-serif font-bold ${textDark}`}>{card.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 text-lg mb-6 font-medium leading-relaxed">{card.content}</p>
              
              {card.steps && (
                <div className="space-y-4">
                  {card.steps.map((step, sIdx) => (
                    <div key={sIdx} className={`relative pl-6 border-l-4 ${borderLeft} py-1`}>
                      <h4 className="font-bold text-slate-900 text-base">{step.title}</h4>
                      <p className="text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start">
         <svg className="w-6 h-6 mr-3 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
         <div>
          <h3 className="text-amber-800 font-bold mb-1">Conseil d'Excellence</h3>
          <p className="text-amber-800/80 text-sm leading-relaxed">
            La clé de la réussite réside dans la gestion du temps. Consacrez impérativement 1h à 1h30 au brouillon pour l'analyse et le plan détaillé. Une rédaction fluide découle d'un plan solide.
          </p>
         </div>
      </div>
    </div>
  );
};

export const Methodology: React.FC = () => {
  const { type } = useParams<{ type?: string }>();

  if (type === 'dissertation' || type === 'commentaire') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <MethodDetail type={type} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-12 text-center">
      <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Méthodologie Officielle</h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
        Choisissez l'exercice que vous souhaitez approfondir. Nos guides sont structurés pour vous accompagner pas à pas.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link to="/methodologie/dissertation" className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all hover:-translate-y-1 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">La Dissertation</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Apprenez à construire une problématique pertinente, un plan dialectique ou thématique, et à articuler vos arguments avec les œuvres du programme.
            </p>
            <span className="inline-flex items-center text-indigo-600 font-semibold">
              Consulter le guide <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </Link>

        <Link to="/methodologie/commentaire" className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all hover:-translate-y-1 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
             <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">Le Commentaire</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Maîtrisez l'analyse linéaire ou composée. Identifiez les procédés stylistiques et donnez du sens au texte sans jamais paraphraser.
            </p>
            <span className="inline-flex items-center text-emerald-600 font-semibold">
              Consulter le guide <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};
