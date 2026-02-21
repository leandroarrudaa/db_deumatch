
import React, { useState } from 'react';
import { Candidate } from '../types';
import { CandidateCard } from './CandidateCard';
import { Copy, Check, Users, ExternalLink, Zap } from 'lucide-react';

interface RecruiterDashboardProps {
  candidates: Candidate[];
  onViewCandidate: (c: Candidate) => void;
  onOpenPublicLink: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ candidates, onViewCandidate, onOpenPublicLink }) => {
  const [copied, setCopied] = useState(false);
  
  // Filter candidates added "Today" (Simulation)
  // In a real app, check `createdAt` timestamp. Here we just take the top 2 as "recent".
  const recentCandidates = candidates.slice(0, 4); 
  const todayCount = 2; // Mock count or calculated from date

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://deumatch.vagas.com/apply/v892-sdr-pleno");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero / Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Link Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">Atrair Novos Talentos</h2>
            <p className="text-white/80 mb-6 max-w-md">Envie este link para candidatos realizarem o teste Big Five. Os resultados aparecerão aqui automaticamente.</p>
            
            <div className="flex gap-2 max-w-lg bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
              <div className="flex-1 flex items-center px-4 text-white/90 font-mono text-sm truncate">
                deumatch.vagas.com/apply/v892...
              </div>
              <button 
                onClick={handleCopyLink}
                className="bg-white text-brand-primary hover:bg-slate-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            
            <button 
                onClick={onOpenPublicLink}
                className="mt-4 text-xs font-bold text-white/70 hover:text-white flex items-center gap-1 hover:underline"
            >
                <ExternalLink size={12} /> Testar/Visualizar página do candidato
            </button>
          </div>
        </div>

        {/* Counter Card */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute inset-0 bg-slate-50/50"></div>
           <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                 <Users size={32} />
              </div>
              <h3 className="text-4xl font-black text-brand-dark mb-1">{todayCount}</h3>
              <p className="text-slate-500 font-medium text-sm">Candidatos Inscritos Hoje</p>
           </div>
        </div>
      </div>

      {/* Live Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Chegaram Recentemente
           </h3>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tempo Real</span>
        </div>

        <div className="space-y-3">
           {recentCandidates.map(candidate => (
              <div key={candidate.id} className="relative group animate-in slide-in-from-left-2 duration-300">
                  <CandidateCard 
                    candidate={candidate} 
                    matchResult={{ 
                      score: 0, 
                      justification: 'Aguardando match com vaga específica', 
                      analysis: { pros: '', cons: '' },
                      details: { skillMatch: 0, cultureMatch: 0, commonSkills: [], missingSkills: [] } 
                    }} // Dummy match for list view
                    variant="list"
                    onClick={() => onViewCandidate(candidate)}
                    actions={
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                            <Zap size={12} /> Análise IA Pronta
                        </div>
                    }
                  />
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};
