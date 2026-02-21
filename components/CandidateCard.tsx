
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Candidate, MatchResult, ApplicationStatus, BigFiveProfile } from '../types';
import { MatchRing } from './MatchRing';
import { Badge } from './Badge';
import { MOCK_JOBS } from '../services/mockData';
import { calculateMatch } from '../services/matchLogic';
import { BigFiveRadar } from './BigFiveRadar';
import { CandidateDossier } from './CandidateDossier';
import { generateCandidatePDF } from '../services/pdfGenerator';
import { Modal } from './Modal';
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Download,
  Activity,
  User,
  MoreHorizontal,
  Zap,
  Target,
  Upload,
  FileText,
  Loader,
  MessageCircle,
  AlertTriangle,
  Edit,
  ShieldCheck,
  Star,
  Crosshair,
  Award,
  Heart,
  Lightbulb,
  Scale,
  BrainCircuit,
  Quote,
  ListChecks,
  Search,
  Printer
} from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  matchResult?: MatchResult;
  status?: ApplicationStatus;
  onClick?: () => void;
  onEdit?: (c: Candidate) => void;
  actions?: React.ReactNode;
  variant?: 'summary' | 'detail' | 'kanban' | 'list';
  onJobClick?: (jobId: string) => void;
}

// --- Helper for Archetype Visuals ---
const getArchetypeConfig = (archetype: string) => {
    if (archetype.includes('Hunter')) return { icon: Crosshair, color: 'text-brand-primary', bg: 'bg-orange-50', border: 'border-orange-100', desc: 'Focado em resultados rápidos, prospecção e volume.' };
    if (archetype.includes('Closer')) return { icon: Award, color: 'text-brand-secondary', bg: 'bg-pink-50', border: 'border-pink-100', desc: 'Especialista em negociação, fechamento e influência.' };
    if (archetype.includes('Diplomata') || archetype.includes('Helper')) return { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Focado em relacionamento, empatia e retenção.' };
    if (archetype.includes('Aprendiz')) return { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'Curioso, ágil e com alto potencial de desenvolvimento.' };
    if (archetype.includes('Analista') || archetype.includes('Lógico')) return { icon: Scale, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100', desc: 'Metódico, organizado e orientado a dados.' };
    return { icon: User, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', desc: 'Perfil equilibrado e adaptável.' };
};

// --- Helper to Generate the 30 Facets based on Big 5 Scores (Simulation) ---
// UPDATED: Now ensures integers via Math.round
const generateFacets = (scores: BigFiveProfile) => {
    // Helper to randomize slightly around the main trait score but keep it realistic
    // And ensure it stays between 0-100 and is an INTEGER.
    const randomize = (base: number, variance = 15) => {
        const val = base + (Math.random() * variance * 2 - variance);
        return Math.round(Math.min(100, Math.max(0, val)));
    };
    
    return {
        openness: [
            { label: 'Imaginação', val: randomize(scores.openness) },
            { label: 'Interesses Artísticos', val: randomize(scores.openness - 15) }, // Sales usually lower here
            { label: 'Emocionalidade', val: randomize(scores.openness) },
            { label: 'Aventura', val: randomize(scores.openness + 10) }, // Sales usually higher
            { label: 'Intelecto', val: randomize(scores.openness + 5) },
            { label: 'Liberalismo', val: randomize(scores.openness) }
        ],
        conscientiousness: [
            { label: 'Autoeficácia', val: randomize(scores.conscientiousness) },
            { label: 'Ordem', val: randomize(scores.conscientiousness + 5) },
            { label: 'Senso de Dever', val: randomize(scores.conscientiousness) },
            { label: 'Esforço de Realização', val: randomize(scores.conscientiousness + 10) }, // Critical for sales
            { label: 'Autodisciplina', val: randomize(scores.conscientiousness + 5) },
            { label: 'Prudência', val: randomize(scores.conscientiousness) }
        ],
        extraversion: [
            { label: 'Cordialidade', val: randomize(scores.extraversion) },
            { label: 'Gregarismo', val: randomize(scores.extraversion + 5) },
            { label: 'Assertividade', val: randomize(scores.extraversion + 15) }, // Critical for sales
            { label: 'Atividade', val: randomize(scores.extraversion) },
            { label: 'Busca de Excitação', val: randomize(scores.extraversion + 5) },
            { label: 'Emoções Positivas', val: randomize(scores.extraversion) }
        ],
        agreeableness: [
            { label: 'Confiança', val: randomize(scores.agreeableness) },
            { label: 'Moralidade', val: randomize(scores.agreeableness + 5) },
            { label: 'Altruísmo', val: randomize(scores.agreeableness) },
            { label: 'Cooperação', val: randomize(scores.agreeableness + 10) },
            { label: 'Modéstia', val: randomize(scores.agreeableness - 10) }, // Sales often lower modesty
            { label: 'Simpatia', val: randomize(scores.agreeableness) }
        ],
        stability: [ // Neuroticismo Invertido
            { label: 'Calma', val: randomize(scores.stability) },
            { label: 'Controle da Raiva', val: randomize(scores.stability + 5) },
            { label: 'Otimismo', val: randomize(scores.stability) }, // Low depression
            { label: 'Segurança Social', val: randomize(scores.stability + 10) }, // Low self-consciousness
            { label: 'Moderação', val: randomize(scores.stability + 5) }, // Low impulsiveness
            { label: 'Resiliência', val: randomize(scores.stability + 15) } // Low vulnerability
        ]
    };
};

const FacetGroup = ({ title, color, facets }: { title: string, color: string, facets: {label: string, val: number}[] }) => (
    <div className="mb-5 last:mb-0">
        <h5 className={`text-[11px] font-black uppercase tracking-widest mb-3 ${color}`}>{title}</h5>
        <div className="space-y-2.5">
            {facets.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-xs group">
                    <span className="text-slate-600 truncate mr-2 w-32 font-medium group-hover:text-brand-dark transition-colors">{f.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        {/* Using Brand Primary for the bar fill to maintain consistency unless overridden */}
                        <div className={`h-full rounded-full bg-brand-primary opacity-80`} style={{ width: `${f.val}%` }}></div>
                    </div>
                    {/* Number Formatting: No decimals, darker color */}
                    <span className="ml-3 w-8 text-right font-bold text-brand-dark tabular-nums">{Math.round(f.val)}%</span>
                </div>
            ))}
        </div>
    </div>
);


export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, matchResult, status, onClick, onEdit, actions, variant = 'summary', onJobClick }) => {
  
  // File Upload State & Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(candidate.resumeUrl ? candidate.resumeUrl.split('/').pop() || 'Currículo.pdf' : null);
  const [resumeFileUrl, setResumeFileUrl] = useState<string | null>(candidate.resumeUrl || null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false); // State for Dossier Modal

  // Derived Facets with integers
  const facets = useMemo(() => generateFacets(candidate.bigFive), [candidate.bigFive]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setResumeFileName(file.name);
      setResumeFileUrl(objectUrl);
    }
  };

  const triggerFileUpload = () => { fileInputRef.current?.click(); };
  
  const handleViewResume = () => {
    if (resumeFileUrl) {
        if (resumeFileUrl.startsWith('blob:') || resumeFileUrl.startsWith('http')) {
           window.open(resumeFileUrl, '_blank');
        } else {
           alert(`Simulação: Para abrir um arquivo real, faça o upload clicando no botão de atualização. \n\nArquivo atual (Mock): ${resumeFileName}`);
        }
    }
  };

  const handleDownloadPDF = () => {
      setIsDownloading(true);
      // Trigger PDF generation
      generateCandidatePDF(candidate, matchResult);
      setTimeout(() => { setIsDownloading(false); }, 1500);
  };

  const handleScheduleInterview = () => {
      const cleanPhone = candidate.phone ? candidate.phone.replace(/\D/g, '') : '';
      if (cleanPhone) {
        const message = encodeURIComponent(`Olá ${candidate.name}, vi seu perfil na plataforma Deu Match e gostaria de agendar uma entrevista.`);
        const url = `https://wa.me/${cleanPhone}?text=${message}`;
        window.open(url, '_blank');
      } else { alert("Número de telefone não cadastrado para este candidato."); }
  };

  const handleGenericAction = (e: React.MouseEvent) => { e.stopPropagation(); alert("Menu de ações rápidas: \n- Enviar E-mail \n- Adicionar Nota \n- Ver Histórico"); }

  useEffect(() => {
    return () => { if (resumeFileUrl && resumeFileUrl.startsWith('blob:')) URL.revokeObjectURL(resumeFileUrl); };
  }, [resumeFileUrl]);

  const recommendedJobs = useMemo(() => {
    if (variant !== 'detail') return [];
    return MOCK_JOBS.map(job => ({ job, match: calculateMatch(candidate, job) }))
    .filter(item => item.match.score > 60)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);
  }, [candidate, variant]);

  const getSincerityBadge = () => {
      if (candidate.sincerityScore < 50) return <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-200"><AlertTriangle size={12} /> Sinceridade Crítica</div>;
      if (candidate.sincerityScore < 75) return <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold border border-orange-200"><AlertTriangle size={12} /> Sinceridade Média</div>;
      return null;
  };

  // --- RENDERS ---

  if (variant === 'list') {
    return (
      <div onClick={onClick} className="group flex items-center px-6 py-4 bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl relative">
        <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
          <img src={candidate.avatarUrl} alt={candidate.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
          <div>
            <h4 className="font-bold text-base text-brand-dark group-hover:text-brand-primary mb-0.5">{candidate.name}</h4>
            <div className="flex flex-col gap-1"><div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={12} /> {candidate.location}</div>{getSincerityBadge()}</div>
          </div>
        </div>
        <div className="w-1/4"><p className="text-sm font-semibold text-slate-700 mb-0.5">{candidate.role}</p><Badge label={candidate.seniority} variant="outline" /></div>
        <div className="w-1/4 hidden md:flex flex-wrap gap-2">{candidate.skills.slice(0, 2).map(skill => (<span key={skill} className="text-[11px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{skill}</span>))}</div>
        <div className="flex-1 flex justify-end items-center gap-6">{matchResult && <span className="font-bold text-base text-brand-primary">{matchResult.score}% <span className="text-xs text-slate-400 font-normal">Match</span></span>}<div className="flex gap-2">{onEdit && (<button onClick={(e) => { e.stopPropagation(); onEdit(candidate); }} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-brand-primary transition-colors"><Edit size={16} /></button>)}<div className="opacity-0 group-hover:opacity-100 transition-opacity">{actions || <button onClick={handleGenericAction} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><MoreHorizontal size={20}/></button>}</div></div></div>
      </div>
    );
  }

  if (variant === 'kanban') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer active:cursor-grabbing mb-3 group relative overflow-hidden" onClick={onClick}>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary to-brand-secondary"></div>
        <div className="flex justify-between items-start mb-3 pl-2">
          <div className="flex items-center gap-3"><img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" /><div className="overflow-hidden"><h4 className="font-bold text-brand-dark text-sm truncate w-32 group-hover:text-brand-primary transition-colors">{candidate.name}</h4><p className="text-[10px] text-slate-500 truncate font-medium">{candidate.role} • {candidate.seniority}</p></div></div>
          {matchResult && <MatchRing score={matchResult.score} size="sm" />}
        </div>
        <div className="pl-2 mt-2"><div className="flex justify-between items-center mb-1.5"><p className="text-[10px] text-slate-400 font-bold uppercase">Destaque</p>{candidate.sincerityScore < 70 && <span title="Alerta de Sinceridade"><AlertTriangle size={12} className="text-red-500" /></span>}</div><div className="flex flex-wrap gap-1.5">{candidate.topSubTraits.slice(0,2).map(t => (<span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{t}</span>))}</div></div>
        {actions && <div className="mt-4 pt-3 border-t border-slate-50 pl-2" onClick={(e) => e.stopPropagation()}>{actions}</div>}
      </div>
    );
  }

  if (variant === 'summary') {
    return (
      <div onClick={onClick} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-brand-primary transition-all"></div>
        {onEdit && (<button onClick={(e) => { e.stopPropagation(); onEdit(candidate); }} className="absolute top-3 left-3 text-slate-300 hover:text-brand-primary p-1 bg-white/50 rounded-full hover:bg-white z-10"><Edit size={14} /></button>)}
        {candidate.sincerityScore < 70 && (<div className="absolute top-3 right-3 text-red-500" title="Alerta de Sinceridade"><AlertTriangle size={16} /></div>)}
        <div className="relative mb-3 mt-1"><div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-brand-primary group-hover:to-brand-secondary transition-colors shadow-sm"><img src={candidate.avatarUrl} className="w-full h-full rounded-full object-cover bg-white" alt={candidate.name} /></div><div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100"><Badge label={candidate.seniority.charAt(0)} variant="outline" className="text-[10px] h-5 w-5 flex items-center justify-center px-0 bg-slate-50" /></div></div>
        <h3 className="font-bold text-brand-dark text-base group-hover:text-brand-primary transition-colors truncate w-full px-1 mb-1">{candidate.name}</h3><p className="text-xs text-brand-primary font-bold mb-3 uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded">{candidate.role}</p>
        <div className="mt-auto w-full pt-3 border-t border-slate-50 flex items-center justify-between px-1"><div className="flex items-center text-xs text-slate-500 gap-1.5"><MapPin size={12} className="text-slate-400" /> {candidate.location.split('-')[0].trim().split(',')[0]}</div>{matchResult && (<span className="text-sm font-black text-brand-dark">{matchResult.score}%</span>)}</div>
        {actions && <div className="mt-4 w-full" onClick={e => e.stopPropagation()}>{actions}</div>}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. DETAIL VARIANT (DOSSIÊ GENERATIVO - 3 COLUMNS GRID)
  // --------------------------------------------------------------------------
  
  const archConfig = getArchetypeConfig(candidate.archetype);
  const ArchetypeIcon = archConfig.icon;

  // --- GENERATIVE EXECUTIVE SUMMARY LOGIC (DEEP) ---
  
  // Paragraph 1: Aggressiveness (Extroversion + Assertiveness)
  let p1_aggression = "";
  if (candidate.bigFive.extraversion >= 75) {
      p1_aggression = `${candidate.name} apresenta um perfil de alta agressividade comercial, ideal para abertura de mercado e prospecção fria. Sua pontuação elevada em Extroversão sugere facilidade natural em quebrar gelo e contornar objeções sociais.`;
  } else if (candidate.bigFive.extraversion >= 50) {
      p1_aggression = `${candidate.name} possui um equilíbrio saudável entre escuta ativa e fala. Não é um "trator" de vendas, mas consegue sustentar negociações com firmeza técnica e postura consultiva.`;
  } else {
      p1_aggression = `${candidate.name} adota uma abordagem mais analítica e introspectiva. Pode ter dificuldades em ambientes de alto volume (Cold Call), mas tende a performar bem em vendas complexas onde a confiança técnica supera o carisma.`;
  }

  // Paragraph 2: Organization (Conscientiousness + Order)
  let p2_organization = "";
  if (candidate.bigFive.conscientiousness >= 80) {
      p2_organization = "No quesito operacional, trata-se de um perfil 'Relógio Suíço'. Altíssima disciplina para manter o CRM atualizado e seguir cadências de follow-up sem necessidade de microgerenciamento. O risco é a rigidez excessiva.";
  } else if (candidate.bigFive.conscientiousness >= 60) {
      p2_organization = "Possui organização funcional adequada para a maioria dos cargos de vendas. Segue processos, mas pode priorizar a improvisação em momentos de pressão para fechar a meta.";
  } else {
      p2_organization = "Atenção para a gestão de processos. O perfil indica baixa adesão a rotinas administrativas e preenchimento de CRM. Requer um gestor que cobre organização ou uma estrutura de Sales Ops de apoio.";
  }

  // Paragraph 3: Interview Strategy
  let p3_strategy = "";
  if (candidate.sincerityScore < 70) {
      p3_strategy = "ESTRATÉGIA DE ENTREVISTA: O indicador de sinceridade está baixo. Explore 'Deep Dives' em números passados. Peça para ver o dashboard ou histórico real, pois há tendência ao exagero de resultados.";
  } else if (candidate.bigFive.agreeableness > 80) {
      p3_strategy = "ESTRATÉGIA DE ENTREVISTA: Teste a capacidade de dizer 'não' e negociar preços. O perfil tende a ceder para agradar o cliente. Simule um cenário de negociação difícil.";
  } else if (candidate.bigFive.stability < 60) {
      p3_strategy = "ESTRATÉGIA DE ENTREVISTA: Investigue como o candidato lida com sequências de 'nãos'. O perfil sugere sensibilidade emocional. Pergunte sobre o momento mais difícil da carreira.";
  } else {
      p3_strategy = "ESTRATÉGIA DE ENTREVISTA: Foco em fit cultural e ambição de longo prazo. O perfil é sólido tecnicamente; valide se os objetivos financeiros dele alinham com o plano de comissão.";
  }

  return (
    <div className="w-full h-full p-6 lg:p-8 flex flex-col gap-6 overflow-hidden select-none bg-slate-50/50">
      
      {/* 3-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full w-full">
        
        {/* COLUMN 1: IDENTITY (3/12) */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
           {/* Profile Card */}
           <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden shrink-0">
               <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-brand-primary to-brand-secondary mb-4 shadow-lg">
                   <img src={candidate.avatarUrl} className="w-full h-full rounded-full object-cover border-4 border-white" alt={candidate.name} />
               </div>
               
               <h2 className="text-2xl font-black text-brand-dark leading-tight mb-1">{candidate.name}</h2>
               <p className="text-sm font-bold text-slate-500 mb-4">{candidate.role} • {candidate.seniority}</p>

               <div className="w-full space-y-3 mb-6">
                   <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-400">Local</span>
                       <span className="text-xs font-bold text-brand-dark">{candidate.location.split('-')[0]}</span>
                   </div>
                   <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-400">Pretensão</span>
                       <span className="text-xs font-bold text-brand-dark">R$ {candidate.salaryExpectation}</span>
                   </div>
               </div>

               <button onClick={handleScheduleInterview} className="w-full py-3 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-3">
                  <MessageCircle size={18} /> Agendar Entrevista
               </button>
               
               {/* New Dossier Button */}
               <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:border-brand-primary/30 hover:text-brand-primary transition-all flex items-center justify-center gap-2 mb-3 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  {isDownloading ? <Loader size={18} className="animate-spin" /> : <FileText size={18} />}
                  {isDownloading ? 'Gerando PDF...' : 'Extrair Resumo'}
               </button>

               <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />
               {resumeFileUrl ? (
                   <button onClick={handleViewResume} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                      <Download size={12} /> Ver Currículo Original
                   </button>
               ) : (
                   <button onClick={triggerFileUpload} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      <Upload size={12} /> Upload CV
                   </button>
               )}
           </div>

           {/* Skills Tags */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 flex-1 min-h-0 overflow-y-auto">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Competências</h4>
                <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMN 2: DOSSIÊ GENERATIVO (5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full min-h-0">
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 h-full overflow-y-auto custom-scrollbar relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl ${archConfig.bg} flex items-center justify-center text-brand-primary`}>
                        <ArchetypeIcon size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-brand-dark">{candidate.archetype}</h3>
                        <p className="text-sm font-medium text-slate-500">Dossiê de Análise Comportamental</p>
                    </div>
                </div>

                {/* Generative Text Blocks (Deep Analysis) */}
                <div className="space-y-8 mb-10">
                    <div className="pl-5 border-l-4 border-brand-primary">
                        <h5 className="text-xs font-black text-brand-primary uppercase mb-2 flex items-center gap-2"><Zap size={14} /> Energia Comercial</h5>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium text-justify">{p1_aggression}</p>
                    </div>
                    
                    <div className="pl-5 border-l-4 border-slate-300">
                        <h5 className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-2"><ListChecks size={14} /> Capacidade de Entrega</h5>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium text-justify">{p2_organization}</p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
                        <Quote size={20} className="absolute top-4 right-4 text-slate-200" />
                        <h5 className="text-xs font-black text-brand-secondary uppercase mb-2 flex items-center gap-2"><Search size={14} /> Veredito da IA</h5>
                        <p className="text-sm text-slate-700 leading-relaxed font-bold italic">{p3_strategy}</p>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="flex justify-center mb-6 pt-4 border-t border-slate-100">
                   <div className="transform scale-90">
                       <BigFiveRadar data={candidate.bigFive} />
                   </div>
                </div>
            </div>
        </div>

        {/* COLUMN 3: RAIO-X & JOBS (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
            
            {/* Raio-X Psicométrico (The 30 Traits) with Internal Scroll */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Fixed Header within Card */}
                <div className="p-6 pb-2 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-brand-dark flex items-center gap-2">
                            <Activity className="text-brand-primary" size={16} /> Raio-X Psicométrico
                        </h4>
                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold border border-slate-200">30 Facetas</span>
                    </div>
                </div>
                
                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 space-y-6">
                    <FacetGroup title="Abertura (Inovação)" color="text-blue-500" facets={facets.openness} />
                    <FacetGroup title="Conscienciosidade (Execução)" color="text-emerald-500" facets={facets.conscientiousness} />
                    <FacetGroup title="Extroversão (Social)" color="text-brand-primary" facets={facets.extraversion} />
                    <FacetGroup title="Amabilidade (Cooperação)" color="text-pink-500" facets={facets.agreeableness} />
                    <FacetGroup title="Estabilidade (Resiliência)" color="text-indigo-500" facets={facets.stability} />
                </div>
            </div>

            {/* Suggested Missions (Fixed at Bottom of Col 3) */}
            <div className="bg-brand-dark rounded-[24px] p-6 shadow-lg border border-slate-700 shrink-0 max-h-[250px] overflow-hidden flex flex-col">
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
                    <Target size={14} className="text-brand-primary" /> Missões Sugeridas
                </h4>
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
                    {recommendedJobs.length > 0 ? recommendedJobs.map(({ job, match }) => (
                         <div key={job.id} onClick={() => onJobClick && onJobClick(job.id)} className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/20 transition-colors group">
                             <div className="overflow-hidden mr-2">
                                 <p className="text-xs font-bold text-white truncate group-hover:text-brand-primary transition-colors">{job.title}</p>
                                 <p className="text-[10px] text-white/50 truncate">{job.company}</p>
                             </div>
                             <span className={`text-xs font-black shrink-0 ${match.score > 80 ? 'text-green-400' : 'text-orange-400'}`}>{Math.round(match.score)}%</span>
                         </div>
                    )) : (
                        <p className="text-xs text-white/30 italic text-center">Sem missões compatíveis.</p>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* DOSSIER MODAL */}
      <Modal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} title="Dossiê do Candidato" size="6xl">
          <div className="relative">
              {/* Print Button Floating */}
              <button 
                onClick={() => window.print()} 
                className="absolute top-4 right-20 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-black transition-colors print:hidden"
              >
                <Printer size={16} /> Imprimir / Salvar PDF
              </button>
              
              <CandidateDossier candidate={candidate} matchResult={matchResult} facets={facets} />
          </div>
      </Modal>

    </div>
  );
};
