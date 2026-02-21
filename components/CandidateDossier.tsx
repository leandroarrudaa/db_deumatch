
import React from 'react';
import { Candidate, MatchResult } from '../types';
import { generatePdfReportData } from '../services/aiSimulation';
import { 
  Zap, BrainCircuit, Target, 
  Activity, ShieldAlert, Award
} from 'lucide-react';

interface CandidateDossierProps {
  candidate: Candidate;
  matchResult?: MatchResult;
  facets?: any; 
}

export const CandidateDossier: React.FC<CandidateDossierProps> = ({ candidate }) => {
  const reportData = generatePdfReportData(candidate);

  // Group facets for UI display
  const traitGroups = [
      { title: 'Sensibilidade Emocional', color: 'bg-indigo-500', data: [
          { l: 'Autoconfiança', v: reportData.facets.autoconfianca },
          { l: 'Temperamento', v: reportData.facets.temperamento },
          { l: 'Impulsividade', v: reportData.facets.impulsividade },
          { l: 'Vulnerabilidade', v: reportData.facets.vulnerabilidade },
      ]},
      { title: 'Amabilidade', color: 'bg-[#FF0072]', data: [ // Brand Pink
          { l: 'Julgamento', v: reportData.facets.julgamento },
          { l: 'Sensibilidade', v: reportData.facets.sensibilidade },
          { l: 'Confronto', v: reportData.facets.confronto },
          { l: 'Competição', v: reportData.facets.competicao },
      ]},
      { title: 'Extroversão', color: 'bg-[#FF7F47]', data: [ // Brand Orange
          { l: 'Desinibição', v: reportData.facets.desinibicao },
          { l: 'Sociabilidade', v: reportData.facets.sociabilidade },
          { l: 'Influência', v: reportData.facets.influencia },
          { l: 'Energia', v: reportData.facets.energia },
      ]},
      { title: 'Disciplina', color: 'bg-emerald-500', data: [
          { l: 'Ambição', v: reportData.facets.ambicao },
          { l: 'Autodisciplina', v: reportData.facets.autodisciplina },
          { l: 'Planejamento', v: reportData.facets.planejado },
          { l: 'Perfeccionismo', v: reportData.facets.perfeccionismo },
      ]},
      { title: 'Abertura ao Novo', color: 'bg-blue-500', data: [
          { l: 'Imaginação', v: reportData.facets.imaginacao },
          { l: 'Intelecto', v: reportData.facets.abertura },
          { l: 'Regulação', v: reportData.facets.regulacao },
          { l: 'Praticidade', v: reportData.facets.praticidade },
      ]},
  ];

  return (
    <div className="p-8 space-y-12">
        
        {/* HEADER */}
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Dossiê Comportamental</h2>
            <p className="text-slate-500 font-medium">Análise de Profundidade • Inteligência Artificial</p>
        </div>

        {/* 1. ARCHETYPE & DNA */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FF7F47] to-[#FF0072]"></div>
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-100 rounded-2xl text-slate-700">
                    <BrainCircuit size={32} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Arquétipo Dominante</p>
                    <h3 className="text-2xl font-black text-slate-800">{reportData.identity.archetype}</h3>
                </div>
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg font-medium">
                {reportData.identity.narrative}
            </p>
        </div>

        {/* 2. FACETS GRID */}
        <div>
            <div className="flex items-center gap-3 mb-6">
                 <Activity className="text-blue-500" />
                 <h3 className="text-xl font-bold text-slate-800">Raio-X Psicométrico</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {traitGroups.map((group) => (
                    <div key={group.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-2 h-2 rounded-full ${group.color}`}></div>
                            <h4 className="font-bold text-slate-700 text-sm uppercase">{group.title}</h4>
                        </div>
                        <div className="space-y-4">
                            {group.data.map((trait) => (
                                <div key={trait.l}>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-500">{trait.l}</span>
                                        <span className="text-slate-800">{trait.v}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${group.color} opacity-80`} 
                                            style={{ width: `${trait.v}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. SYNTHESIS */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Zap className="text-yellow-500" /> Síntese e Interpretação
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {reportData.synthesis.text}
            </p>
        </div>

        {/* 4. MANAGER MANUAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h4 className="font-black text-green-800 mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                    <Award size={18} /> Onde ele é Imbatível
                </h4>
                <p className="text-green-900 text-sm leading-relaxed whitespace-pre-line">
                    {reportData.managerManual.potency}
                </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <h4 className="font-black text-orange-800 mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                    <ShieldAlert size={18} /> Pontos de Risco
                </h4>
                <p className="text-orange-900 text-sm leading-relaxed whitespace-pre-line">
                    {reportData.managerManual.risks}
                </p>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 lg:col-span-2">
                 <h4 className="font-black text-indigo-800 mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                    <Target size={18} /> Guia de Gestão
                </h4>
                <p className="text-indigo-900 text-sm leading-relaxed whitespace-pre-line">
                    {reportData.managerManual.management}
                </p>
            </div>
        </div>

    </div>
  );
};
