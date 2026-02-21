
import React from 'react';
import { Job, Candidate } from '../types';
import { Badge } from './Badge';
import { 
    Briefcase, Globe, Instagram, Target, Edit, CheckCircle, 
    MapPin, DollarSign, Layers, Clock, Shield,
    Zap, Award, TrendingUp, Crosshair, Sword, Box, UserCheck, Wallet, Dna
} from 'lucide-react';

interface JobDetailViewProps {
  job: Job;
  candidate?: Candidate; // If present, we are in "Match Mode"
  onEdit?: () => void;
  onAddCandidate?: () => void;
  onCancel?: () => void;
}

// Helper to simulate data if missing (Fallback for old jobs/mock data)
const getSafeData = (job: Job) => {
    const roleMap: Record<string, any> = {
        'SDR': {
            icp: 'Gerentes e Diretores de empresas PME/Mid-Market.',
            stack: ['CRM Pipedrive', 'LinkedIn Sales Nav', 'Phone'],
            routine: ['09:00 - Prospecção', '11:00 - Qualificação', '14:00 - Follow-up', '16:00 - Reunião Time'],
            product: 'Soluções SaaS B2B focadas em eficiência.',
            profile: 'Perfil Hunter com alta energia e resiliência.'
        },
        'Closer': {
            icp: 'C-Level de Grandes Empresas.',
            stack: ['Salesforce', 'DocuSign', 'Zoom', 'Gong'],
            routine: ['09:00 - Pipeline Review', '10:00 - Demos', '15:00 - Negociação', '17:00 - Admin'],
            product: 'Software Enterprise de alta complexidade.',
            profile: 'Perfil Consultivo, estratégico e organizado.'
        },
        'default': {
            icp: 'Clientes Potenciais Qualificados.',
            stack: ['CRM Corporativo', 'Email', 'Excel'],
            routine: ['09:00 - Planejamento', '10:00 - Execução', '16:00 - Relatórios'],
            product: 'Serviços e Produtos da Empresa.',
            profile: 'Profissional dedicado e competente.'
        }
    };
    const defaults = roleMap[job.role.includes('SDR') ? 'SDR' : job.role.includes('Closer') || job.role.includes('Account') ? 'Closer' : 'default'];

    return {
        icp: job.icp || defaults.icp,
        techStack: job.techStack || defaults.stack,
        dailyRoutine: job.dailyRoutine || defaults.routine,
        productSolution: job.productSolution || defaults.product,
        idealProfile: job.idealProfile || defaults.profile
    };
};

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, candidate, onEdit, onAddCandidate, onCancel }) => {
  const { icp, techStack, dailyRoutine, productSolution, idealProfile } = getSafeData(job);

  return (
    <div className="h-full flex flex-col relative bg-slate-50/50">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 lg:p-6 pb-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div>
                 <h1 className="text-3xl font-black text-brand-dark mb-2">{job.title}</h1>
                 <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100"><Briefcase size={16} className="text-brand-primary" /> {job.company}</span>
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100"><MapPin size={16} className="text-brand-primary" /> {job.location}</span>
                     <Badge label={job.seniority} variant="orange" />
                 </div>
             </div>
             {onEdit && (
                 <button onClick={onEdit} className="self-start md:self-center px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 hover:text-brand-primary hover:border-brand-primary/50 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
                     <Edit size={18} /> Editar Vaga
                 </button>
             )}
        </div>

        {/* TACTICAL MANDATE BANNER */}
        {job.tacticalMandate && (
            <div className="bg-gradient-to-r from-[#FF7F47] to-[#FF0072] rounded-xl p-6 md:p-8 shadow-lg mb-8 relative overflow-hidden group">
                 {/* Decorative background elements */}
                 <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                 <div className="absolute bottom-0 left-0 p-8 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                 
                 <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-3">
                         <Target className="text-white" size={20} />
                         <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] opacity-90">Resumo Tático da Vaga</h3>
                     </div>
                     <p className="text-white font-medium text-lg md:text-xl leading-relaxed opacity-100 drop-shadow-sm">
                         {job.tacticalMandate}
                     </p>
                 </div>
            </div>
        )}

        <div className="space-y-8">
            
            {/* NÍVEL 1: O CONTEXTO (0-30%) */}
            <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">1</span>
                    Contexto & DNA (0-30%)
                </h3>
                <div className="space-y-4">
                    {/* DNA da Empresa */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                        <h2 className="text-sm font-black text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Dna size={18} /> DNA da Empresa
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            {job.companyDescription}
                        </p>
                        <div className="flex gap-3 mt-4">
                            {job.website && (
                                <a href={job.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    <Globe size={14} /> Site
                                </a>
                            )}
                            {job.instagram && (
                                <a href={job.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-pink-600 transition-colors bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    <Instagram size={14} /> Instagram
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* O Produto */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Box size={18} className="text-blue-500" /> Produto / Solução
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {productSolution}
                            </p>
                        </div>

                        {/* Nicho & ICP */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Target size={18} className="text-brand-secondary" /> Nicho & ICP (Quem Compramos)
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {icp}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NÍVEL 2: O CAMPO DE BATALHA (31-70%) */}
            <section>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">2</span>
                    Campo de Batalha (31-70%)
                </h3>
                <div className="space-y-4">
                     {/* Perfil Desejado */}
                     <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                            <UserCheck size={18} className="text-green-600" /> Perfil Desejado
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {idealProfile}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Desafios */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Sword size={100} /></div>
                             <h2 className="text-sm font-black text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                <Crosshair size={18} /> Principais Desafios
                             </h2>
                             <ul className="space-y-3 relative z-10">
                                {job.challenges.map((c, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="mt-0.5 w-5 h-5 rounded-md bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0 text-[10px] font-black">
                                            {i + 1}
                                        </div>
                                        <span className="font-medium">{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tech Stack */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                             <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Layers size={18} className="text-purple-500" /> Stack Tecnológica
                             </h2>
                             <div className="flex flex-wrap gap-2">
                                 {techStack.map(t => (
                                     <span key={t} className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                                         {t}
                                     </span>
                                 ))}
                             </div>
                        </div>
                     </div>
                </div>
            </section>

            {/* NÍVEL 3: A REALIDADE E RECOMPENSA (71-100%) */}
            <section>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">3</span>
                    Realidade & Recompensa (71-100%)
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     {/* Rotina */}
                     <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                         <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-brand-secondary" /> A Rotina (Hora a Hora)
                         </h2>
                         <div className="space-y-0 relative">
                             <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                             {dailyRoutine.map((item, i) => (
                                 <div key={i} className="flex items-start gap-4 mb-4 last:mb-0 relative z-10">
                                     <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white shrink-0 mt-1"></div>
                                     <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full">
                                        {item}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>

                     <div className="space-y-4">
                        {/* Estrutura de Ganhos */}
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                            <h2 className="text-sm font-black text-green-700 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                                <Wallet size={18} /> Estrutura de Ganhos
                            </h2>
                            
                            <div className="mb-6 relative z-10">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Faixa Estimada</p>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">
                                    R$ {(job.salaryRange[0]/1000).toFixed(0)}k <span className="text-slate-300 mx-1">/</span> {(job.salaryRange[1]/1000).toFixed(0)}k
                                </p>
                            </div>
                            
                            <div className="p-4 bg-white/80 rounded-xl border border-green-100 relative z-10 backdrop-blur-sm">
                                <p className="text-xs font-bold text-green-800 uppercase mb-2 flex items-center gap-1">
                                    <TrendingUp size={12} /> Detalhe da Comissão
                                </p>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {job.compensationDetails}
                                </p>
                            </div>
                        </div>
                     </div>
                </div>
            </section>
        </div>
      </div>

      {/* MATCH ACTION BAR (Floating Bottom) */}
      {candidate && onAddCandidate && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300 z-50">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <img src={candidate.avatarUrl} className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-sm" alt={candidate.name} />
                      <div className="hidden sm:block">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Adicionar ao Pipeline</p>
                          <p className="text-sm font-bold text-brand-dark">{candidate.name}</p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                      <button 
                          onClick={onCancel}
                          className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={onAddCandidate}
                          className="px-8 py-3 bg-brand-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
                      >
                          <CheckCircle size={18} /> Confirmar Adição
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
