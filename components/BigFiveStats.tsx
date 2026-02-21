import React from 'react';

interface BigFiveStatsProps {
  scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    stability: number;
  };
  compact?: boolean;
}

export const BigFiveStats: React.FC<BigFiveStatsProps> = ({ scores, compact = false }) => {
  const traits = [
    { key: 'openness', label: 'Abertura (Inovação)', score: scores.openness, color: 'bg-blue-500' },
    { key: 'conscientiousness', label: 'Disciplina (Execução)', score: scores.conscientiousness, color: 'bg-emerald-500' }, // Most important for sales
    { key: 'extraversion', label: 'Extroversão (Social)', score: scores.extraversion, color: 'bg-orange-500' },
    { key: 'agreeableness', label: 'Amabilidade (Cooperação)', score: scores.agreeableness, color: 'bg-pink-500' },
    { key: 'stability', label: 'Estabilidade (Resiliência)', score: scores.stability, color: 'bg-indigo-500' },
  ];

  if (compact) {
    // Show only top 2 traits for compact view
    const topTraits = [...traits].sort((a, b) => b.score - a.score).slice(0, 2);
    return (
      <div className="flex gap-2 mt-2">
        {topTraits.map(t => (
          <div key={t.key} className="flex items-center gap-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
             <div className={`w-1.5 h-1.5 rounded-full ${t.color}`}></div>
             <span className="font-bold text-slate-700">{t.label.split(' ')[0]}</span>
             <span className="text-slate-500">{t.score}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {traits.map((trait) => (
        <div key={trait.key} className="group">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{trait.label}</span>
            <span className={`text-xs font-bold ${trait.score > 70 ? 'text-slate-800' : 'text-slate-400'}`}>
              {trait.score}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${trait.color} opacity-90 group-hover:opacity-100`}
              style={{ width: `${trait.score}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};