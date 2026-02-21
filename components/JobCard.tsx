
import React from 'react';
import { Job, MatchResult } from '../types';
import { Badge } from './Badge';
import { MatchRing } from './MatchRing';
import { MapPin, Briefcase, DollarSign, ChevronRight, Edit } from 'lucide-react';

interface JobCardProps {
  job: Job;
  matchResult?: MatchResult;
  onClick?: () => void;
  onEdit?: (job: Job) => void;
  selected?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, matchResult, onClick, onEdit, selected }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-5 cursor-pointer transition-all duration-300 group border
        ${selected 
          ? 'bg-white shadow-xl ring-2 ring-brand-primary border-transparent' 
          : 'bg-white hover:shadow-lg border-slate-200 hover:border-brand-primary/50'
        }
      `}
    >
      {/* Active Indicator Strip */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary to-brand-secondary"></div>
      )}

      {/* Edit Button (Top Right) */}
      {onEdit && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(job); }}
          className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-brand-primary hover:bg-slate-50 rounded-full transition-colors z-20"
          title="Editar Vaga"
        >
          <Edit size={14} />
        </button>
      )}

      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1 pr-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg text-brand-dark group-hover:text-brand-primary transition-colors truncate">
              {job.title}
            </h3>
            {job.active && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 border border-green-200 ml-2 shrink-0">
                Ativo
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500 mb-3">{job.company}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-500 text-xs mb-4">
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} className="text-brand-primary" />
              <span>{job.seniority}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-brand-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-brand-primary" />
              <span>{job.salaryRange[0]/1000}k - {job.salaryRange[1]/1000}k</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 2).map((skill) => (
              <Badge key={skill} label={skill} variant="outline" className="bg-slate-50" />
            ))}
             {job.requiredSkills.length > 2 && (
              <span className="text-xs text-slate-400 self-center">+{job.requiredSkills.length - 2}</span>
            )}
          </div>
        </div>

        {selected && (
           <ChevronRight className="text-brand-primary self-center ml-2" />
        )}
      </div>
    </div>
  );
};
