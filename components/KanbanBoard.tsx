import React from 'react';
import { Candidate, MatchResult, ApplicationStatus } from '../types';
import { CandidateCard } from './CandidateCard';
import { MoreHorizontal } from 'lucide-react';

interface KanbanBoardProps {
  candidates: { candidate: Candidate; match: MatchResult; status: ApplicationStatus }[];
  onMoveCandidate: (id: string, newStatus: ApplicationStatus) => void;
  onCardClick: (candidate: Candidate, match?: MatchResult) => void;
}

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: 'top_talent', label: 'Top Talentos' },
  { id: 'interview', label: '1ª Entrevista' },
  { id: 'simulation', label: 'Simulação' },
  { id: 'sent_to_company', label: 'Enviado p/ Empresa' },
  { id: 'hired', label: 'Contratado' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidates, onMoveCandidate, onCardClick }) => {
  
  const handleColumnAction = (colLabel: string) => {
      alert(`Ações da coluna "${colLabel}":\n\n- Ordenar por Match\n- Ordenar por Data\n- Automações de e-mail\n- Editar Estágio`);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
      {COLUMNS.map(col => {
        const colCandidates = candidates.filter(c => c.status === col.id);
        
        return (
          <div key={col.id} className="min-w-[280px] w-[280px] flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-brand-dark text-sm">{col.label}</h4>
                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {colCandidates.length}
                </span>
              </div>
              <button 
                onClick={() => handleColumnAction(col.label)}
                className="text-slate-400 hover:text-brand-dark p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Column Body */}
            <div className="flex-1 bg-slate-100/50 rounded-xl p-2 border border-slate-200/60 overflow-y-auto custom-scrollbar">
              {colCandidates.map(item => (
                <CandidateCard
                  key={item.candidate.id}
                  candidate={item.candidate}
                  matchResult={item.match}
                  status={item.status}
                  variant="kanban"
                  onClick={() => onCardClick(item.candidate, item.match)}
                  actions={
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                      {col.id !== 'top_talent' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onMoveCandidate(item.candidate.id, getPrevStatus(col.id)); }}
                           className="hover:text-brand-dark px-2 py-1 hover:bg-white rounded transition-colors"
                         >
                           ← Voltar
                         </button>
                      )}
                      {col.id !== 'hired' && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onMoveCandidate(item.candidate.id, getNextStatus(col.id)); }}
                            className="ml-auto hover:text-brand-primary px-2 py-1 hover:bg-white rounded transition-colors"
                         >
                           Avançar →
                         </button>
                      )}
                    </div>
                  }
                />
              ))}
              
              {/* Empty State placeholder */}
              {colCandidates.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                  Vazio
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

// Helpers for simple movement (in a real app, use DnD)
const getNextStatus = (current: ApplicationStatus): ApplicationStatus => {
  const order: ApplicationStatus[] = ['top_talent', 'interview', 'simulation', 'sent_to_company', 'hired'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : current;
};

const getPrevStatus = (current: ApplicationStatus): ApplicationStatus => {
  const order: ApplicationStatus[] = ['top_talent', 'interview', 'simulation', 'sent_to_company', 'hired'];
  const idx = order.indexOf(current);
  return idx > 0 ? order[idx - 1] : current;
};