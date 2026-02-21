
import React, { useState, useMemo } from 'react';
import { Job, Candidate, MatchResult } from '../types';
import { calculateMatch } from '../services/matchLogic';
import { Badge } from './Badge';
import { 
    CheckCircle, AlertTriangle, ChevronRight, User, 
    Search, Sparkles, BrainCircuit, Crown, Trophy, Medal,
    BarChart3, X, Zap
} from 'lucide-react';

interface TalentMatchViewProps {
  job: Job;
  candidates: Candidate[];
  onAddToPipeline: (candidateId: string) => void;
  onViewProfile: (candidate: Candidate) => void;
}

export const TalentMatchView: React.FC<TalentMatchViewProps> = ({ job, candidates, onAddToPipeline, onViewProfile }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<{ candidate: Candidate, match: MatchResult } | null>(null);

  // Calculate matches for all candidates and sort by score descending
  const matchedCandidates = useMemo(() => {
    return candidates
      .map(candidate => ({
        candidate,
        match: calculateMatch(candidate, job)
      }))
      .filter(item => item.match.score > 0) // Filter out 0 matches if any
      .sort((a, b) => b.match.score - a.match.score);
  }, [job, candidates]);

  // Split Top 5 (Leaderboard) and the Rest
  const top5 = matchedCandidates.slice(0, 5);
  const others = matchedCandidates.slice(5);

  return (
    <div className="h-full flex flex-col relative bg-slate-50/50">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">
        
        {/* LEADERBOARD HEADER */}
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <Trophy size={20} />
            </div>
            <div>
                <h2 className="text-xl font-black text-brand-dark tracking-tight">Top 5 Elite Matches</h2>
                <p className="text-xs text-slate-500 font-medium">Os perfis com maior aderência ao mandato.</p>
            </div>
        </div>

        {/* LEADERBOARD GRID (GAMIFIED HERO CARDS) 
            - Added pt-12 to prevent top clipping of badges
            - Added overflow-visible to allow glow/shadows to spread
        */}
        {top5.length > 0 && (
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto overflow-y-visible pt-12 pb-8 px-2 snap-x snap-mandatory">
                {top5.map(({ candidate, match }, index) => {
                    const rank = index + 1;
                    const isChampion = rank === 1;
                    const isRunnerUp = rank === 2;
                    const isThird = rank === 3;
                    
                    // Gamification Styles
                    let rankBg = 'bg-slate-700 text-white border-2 border-white';
                    let rankIcon = <span className="font-bold">{rank}</span>;
                    
                    if (isChampion) {
                        rankBg = 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-2 border-white shadow-lg shadow-orange-500/50';
                        rankIcon = <Crown size={14} fill="currentColor" />;
                    } else if (isRunnerUp) {
                        rankBg = 'bg-slate-400 text-white border-2 border-white shadow-md shadow-slate-400/50';
                        rankIcon = <Medal size={14} fill="currentColor" className="text-slate-100" />;
                    } else if (isThird) {
                        rankBg = 'bg-amber-600 text-white border-2 border-white shadow-md shadow-amber-600/50';
                        rankIcon = <Medal size={14} fill="currentColor" className="text-amber-100" />;
                    }

                    return (
                        <div 
                            key={candidate.id}
                            onClick={() => setSelectedCandidate({ candidate, match })}
                            className={`
                                relative flex flex-col items-center p-4 rounded-3xl cursor-pointer transition-all duration-300 group snap-center min-w-[180px] sm:min-w-0
                                ${isChampion 
                                    ? 'bg-white ring-2 ring-brand-primary/20 shadow-[0_0_30px_rgba(255,0,114,0.25)] hover:shadow-[0_0_40px_rgba(255,0,114,0.4)] scale-105 z-10' 
                                    : 'bg-white border border-slate-200 hover:border-brand-primary/50 hover:shadow-xl hover:-translate-y-2'
                                }
                            `}
                        >
                            {/* RANKING BADGE */}
                            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-20 ${rankBg}`}>
                                {rankIcon}
                            </div>

                            {/* Champion Glow Effect Overlay */}
                            {isChampion && (
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none"></div>
                            )}

                            {/* AVATAR */}
                            <div className="relative mb-3 mt-3">
                                <div className={`
                                    rounded-full p-1 mx-auto
                                    ${isChampion ? 'bg-brand-gradient w-20 h-20 shadow-md' : 'bg-slate-100 w-16 h-16'}
                                `}>
                                    <img src={candidate.avatarUrl} alt={candidate.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                                </div>
                                {isChampion && (
                                    <div className="absolute -bottom-2 -right-0 bg-white p-1 rounded-full shadow-sm animate-bounce border border-slate-100">
                                        <span className="text-lg">🔥</span>
                                    </div>
                                )}
                            </div>

                            {/* INFO */}
                            <div className="text-center w-full relative z-10 px-1">
                                <h3 className={`font-bold text-sm truncate w-full mb-0.5 ${isChampion ? 'text-brand-dark text-base' : 'text-slate-700'}`}>
                                    {candidate.name}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-medium mb-4 truncate w-full uppercase tracking-wide">
                                    {candidate.role}
                                </p>

                                {/* XP BAR / MATCH POWER */}
                                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1 overflow-hidden border border-slate-200">
                                    <div 
                                        className={`h-full rounded-full relative ${isChampion ? 'bg-brand-gradient animate-pulse-slow' : 'bg-slate-400 group-hover:bg-brand-primary transition-colors'}`} 
                                        style={{ width: `${match.score}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Match Power</span>
                                    <span className={`text-[10px] font-black ${isChampion ? 'text-brand-primary' : 'text-slate-600'}`}>{match.score}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* DIVIDER */}
        {others.length > 0 && (
            <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={14} /> Outros Candidatos na Rede
                </div>
            </div>
        )}

        {/* STANDARD LIST (THE REST) */}
        <div className="space-y-3">
            {others.map(({ candidate, match }, index) => (
                <div 
                    key={candidate.id}
                    onClick={() => setSelectedCandidate({ candidate, match })}
                    className={`
                        group flex items-center justify-between p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-lg relative overflow-hidden
                        ${selectedCandidate?.candidate.id === candidate.id ? 'border-brand-primary ring-1 ring-brand-primary shadow-md' : 'border-slate-200 hover:border-brand-primary/30'}
                    `}
                >
                    {/* Selected Indicator */}
                    {selectedCandidate?.candidate.id === candidate.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>}

                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
                            {index + 6}
                        </div>
                        {/* Avatar */}
                        <div className="relative">
                            <img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                        </div>
                        
                        {/* Info */}
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-primary transition-colors">{candidate.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{candidate.role}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <Badge label={candidate.seniority} variant="outline" className="text-[10px] px-1.5 py-0" />
                            </div>
                        </div>
                    </div>

                    {/* Match Circle (Simplified for List) */}
                    <div className="flex items-center gap-4">
                        <div className={`
                            font-black text-sm
                            ${match.score >= 70 ? 'text-brand-dark' : 'text-slate-400'}
                        `}>
                            {match.score}%
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* BATTLE CARD (SIDE DRAWER) */}
      {selectedCandidate && (
          <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
                onClick={() => setSelectedCandidate(null)}
            ></div>

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col border-l border-white/20">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md shrink-0">
                  <div className="flex items-center gap-4">
                      <div className="relative">
                          <img src={selectedCandidate.candidate.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white ${selectedCandidate.match.score >= 80 ? 'bg-brand-gradient' : 'bg-slate-400'}`}>
                              {selectedCandidate.match.score}
                          </div>
                      </div>
                      <div>
                          <h3 className="font-bold text-brand-dark text-base">{selectedCandidate.candidate.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <Zap size={12} className="text-brand-primary fill-current" />
                              <span>Análise de Compatibilidade IA</span>
                          </div>
                      </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCandidate(null)} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-brand-dark transition-colors"
                  >
                      <X size={20} />
                  </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                  
                  {/* PROS */}
                  <div className="space-y-3">
                      <h4 className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle size={16} /> Elite Match: Pontos Fortes
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400"></div>
                          {selectedCandidate.match.analysis.pros}
                      </p>
                  </div>

                  {/* CONS (RISK ANALYSIS) - NEW STRUCTURE */}
                  <div className="space-y-3">
                      <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle size={16} /> Gaps Táticos & Atenção
                      </h4>
                      <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                          <ul className="space-y-4">
                              {selectedCandidate.match.analysis.cons.split('\n\n').map((gap, i) => (
                                  <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-3">
                                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                      <span>
                                          {/* Simple parser for **bold** text */}
                                          {gap.split('**').map((part, idx) => 
                                              idx % 2 === 1 ? <strong key={idx} className="text-slate-900 font-bold">{part}</strong> : part
                                          )}
                                      </span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Deep Dive Score</h4>
                      <div className="space-y-4">
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-600">Alinhamento Técnico (Hard Skills)</span>
                                  <span className="text-brand-dark">{selectedCandidate.match.details.skillMatch}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-slate-700 h-full rounded-full" style={{ width: `${selectedCandidate.match.details.skillMatch}%` }}></div>
                              </div>
                          </div>
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-brand-primary">Fit Cultural & Comportamental</span>
                                  <span className="text-brand-primary">{selectedCandidate.match.details.cultureMatch}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-brand-gradient h-full rounded-full" style={{ width: `${selectedCandidate.match.details.cultureMatch}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>

              </div>

              {/* Fixed Footer Actions */}
              <div className="p-6 border-t border-slate-200 bg-white shrink-0 flex flex-col gap-3 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] z-10">
                  <button 
                      onClick={() => {
                          onAddToPipeline(selectedCandidate.candidate.id);
                          setSelectedCandidate(null);
                      }}
                      className="w-full py-4 bg-brand-gradient text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                      <BrainCircuit size={20} /> Mover para Pipeline
                  </button>
                  <button 
                      onClick={() => onViewProfile(selectedCandidate.candidate)}
                      className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                      <Search size={20} /> Ver Perfil Completo
                  </button>
              </div>
            </div>
          </>
      )}
    </div>
  );
};
