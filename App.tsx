
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_JOBS, MOCK_CANDIDATES } from './services/mockData';
import { calculateMatch } from './services/matchLogic';
import { generateAIAnalysis, generateTacticalMandate } from './services/aiSimulation'; 
import { Job, Candidate, Application, ApplicationStatus, MatchResult, Role, Seniority, BigFiveProfile } from './types';
import { JobCard } from './components/JobCard';
import { CandidateCard } from './components/CandidateCard';
import { KanbanBoard } from './components/KanbanBoard';
import { Modal } from './components/Modal';
import { Badge } from './components/Badge';
import { AddJobForm } from './components/AddJobForm';
import { AddCandidateForm } from './components/AddCandidateForm';
import { JobDetailView } from './components/JobDetailView';
import { TalentMatchView } from './components/TalentMatchView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { RecruiterDashboard } from './components/RecruiterDashboard'; 
import { fetchStates, fetchCities, State } from './services/locations';
import { 
  Users, 
  Briefcase, 
  Search, 
  Plus, 
  Sparkles,
  ArrowLeft,
  Filter,
  LayoutGrid,
  List,
  X,
  Settings,
  CalendarClock,
  Edit,
  MapPin,
  ClipboardList,
  Globe,
  Instagram,
  Target
} from 'lucide-react';

type TabView = 'jobs' | 'talent-pool' | 'onboarding';
type JobViewMode = 'details' | 'pipeline' | 'matches'; // Added 'matches'
type ViewMode = 'grid' | 'list';

const App: React.FC = () => {
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('jobs');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Data
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobViewMode, setJobViewMode] = useState<JobViewMode>('details');
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>(undefined);
  
  // Match Context State (For adding candidate from profile to job)
  const [previewJobContext, setPreviewJobContext] = useState<{ job: Job, candidate: Candidate } | null>(null);

  // Locations Data
  const [statesList, setStatesList] = useState<State[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [seniorityFilter, setSeniorityFilter] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [showKanbanFilters, setShowKanbanFilters] = useState(false);

  const [applications, setApplications] = useState<Application[]>([
    { jobId: 'j1', candidateId: 'c1', status: 'interview', appliedAt: '2023-10-26' },
    { jobId: 'j1', candidateId: 'c4', status: 'top_talent', appliedAt: '2023-10-27' },
    { jobId: 'j2', candidateId: 'c2', status: 'sent_to_company', appliedAt: '2023-10-22' }
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [candidateToInvite, setCandidateToInvite] = useState<Candidate | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<{ candidate: Candidate, match?: MatchResult, status?: ApplicationStatus } | null>(null);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // Load States on mount
  useEffect(() => {
    const loadStates = async () => {
        const states = await fetchStates();
        setStatesList(states);
    };
    loadStates();
  }, []);

  // Update available cities for filter
  useEffect(() => {
    const loadCities = async () => {
        if (filterState) {
            const cities = await fetchCities(filterState);
            setAvailableCities(cities);
            setFilterCity('');
        } else {
            setAvailableCities([]);
            setFilterCity('');
        }
    };
    loadCities();
  }, [filterState]);

  const checkLocationMatch = (locationStr: string) => {
      if (!locationStr) return false;
      const normalizedLoc = locationStr.toLowerCase();
      
      let stateMatch = true;
      if (filterState) {
          stateMatch = normalizedLoc.includes(`- ${filterState.toLowerCase()}`) || normalizedLoc.includes(filterState.toLowerCase());
      }
      
      let cityMatch = true;
      if (filterCity) {
          cityMatch = normalizedLoc.includes(filterCity.toLowerCase());
      }
      
      return stateMatch && cityMatch;
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const basicSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const locMatch = checkLocationMatch(job.location);
      return basicSearch && locMatch;
    });
  }, [jobs, searchQuery, filterState, filterCity]);

  const pipelineCandidates = useMemo(() => {
    if (!selectedJob) return [];
    let jobApps = applications.filter(app => app.jobId === selectedJob.id && app.status !== 'rejected');
    if (showKanbanFilters && searchQuery) {
        jobApps = jobApps.filter(app => {
            const c = candidates.find(cand => cand.id === app.candidateId);
            return c?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }
    return jobApps.map(app => {
      const candidate = candidates.find(c => c.id === app.candidateId);
      if (!candidate) return null;
      return {
        candidate,
        match: calculateMatch(candidate, selectedJob),
        status: app.status
      };
    }).filter(item => item !== null);
  }, [selectedJob, applications, candidates, showKanbanFilters, searchQuery]);

  const aiSuggestions = useMemo(() => {
    if (!selectedJob) return [];
    const existingIds = new Set(applications.filter(app => app.jobId === selectedJob.id).map(a => a.candidateId));
    return candidates
      .filter(c => !existingIds.has(c.id))
      .map(c => ({ candidate: c, match: calculateMatch(c, selectedJob) }))
      .filter(item => item.match.score >= 70)
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);
  }, [selectedJob, candidates, applications]);

  const filteredTalents = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter ? c.role === roleFilter : true;
      const matchesSeniority = seniorityFilter ? c.seniority === seniorityFilter : true;
      const matchesLoc = checkLocationMatch(c.location);
      return matchesSearch && matchesRole && matchesSeniority && matchesLoc;
    });
  }, [candidates, searchQuery, roleFilter, seniorityFilter, filterState, filterCity]);

  // Actions
  const handleMoveCandidate = (candidateId: string, newStatus: ApplicationStatus) => {
    if (!selectedJobId) return;
    setApplications(prev => prev.map(app => (app.candidateId === candidateId && app.jobId === selectedJobId) ? { ...app, status: newStatus } : app));
  };

  const handleAddToPipeline = (candidateId: string) => {
    if (!selectedJobId) return;
    if (applications.some(app => app.jobId === selectedJobId && app.candidateId === candidateId)) {
        alert("Candidato já está no pipeline.");
        return;
    }
    setApplications(prev => [...prev, { jobId: selectedJobId, candidateId: candidateId, status: 'top_talent', appliedAt: new Date().toISOString().split('T')[0] }]);
    alert("Candidato adicionado ao pipeline com sucesso!");
  };

  const handleInviteClick = (candidate: Candidate) => {
    setCandidateToInvite(candidate);
    setIsInviteModalOpen(true);
  };

  const confirmInvite = (jobId: string) => {
    if (!candidateToInvite) return;
    const exists = applications.find(app => app.jobId === jobId && app.candidateId === candidateToInvite.id);
    if (!exists) {
      setApplications(prev => [...prev, { jobId, candidateId: candidateToInvite.id, status: 'top_talent', appliedAt: new Date().toISOString().split('T')[0] }]);
      alert(`Convite enviado com sucesso para ${candidateToInvite.name}!`);
    } else {
      alert(`${candidateToInvite.name} já está no processo seletivo desta vaga.`);
    }
    setIsInviteModalOpen(false);
    setCandidateToInvite(null);
    setActiveTab('jobs');
    setSelectedJobId(jobId);
    setJobViewMode('details');
  };

  // Logic for adding candidate via Preview Modal
  const confirmAddFromPreview = () => {
      if (!previewJobContext) return;
      const { job, candidate } = previewJobContext;

      const exists = applications.find(app => app.jobId === job.id && app.candidateId === candidate.id);
      if (exists) {
          alert("Este candidato já está no pipeline desta vaga.");
      } else {
          setApplications(prev => [...prev, { jobId: job.id, candidateId: candidate.id, status: 'top_talent', appliedAt: new Date().toISOString().split('T')[0] }]);
          alert(`${candidate.name} adicionado ao pipeline da vaga ${job.title}!`);
      }
      setPreviewJobContext(null);
  };

  const openAddJobModal = () => { setEditingJob(undefined); setIsAddJobModalOpen(true); };
  const openEditJobModal = () => { if(selectedJob) { setEditingJob(selectedJob); setIsAddJobModalOpen(true); } };

  // Edit Candidate Handler
  const openAddCandidateModal = () => { setEditingCandidate(undefined); setIsAddCandidateModalOpen(true); };
  const openEditCandidateModal = (candidate: Candidate) => { setEditingCandidate(candidate); setIsAddCandidateModalOpen(true); };

  const handleSaveJob = (jobData: any) => {
    // Generate AI Mandate
    const mandate = generateTacticalMandate(jobData);
    const updatedJob = { ...jobData, tacticalMandate: mandate };

    if (editingJob) {
       setJobs(prev => prev.map(j => j.id === jobData.id ? updatedJob : j));
       alert("Vaga atualizada com sucesso! Novo Mandato Tático gerado.");
    } else {
       const newJob: Job = {
         id: `j${Date.now()}`,
         ...updatedJob,
         challenges: [], 
         requiredSkills: typeof jobData.requiredSkills === 'string' ? jobData.requiredSkills.split(',').map((s:string) => s.trim()) : jobData.requiredSkills,
         cultureFit: typeof jobData.cultureFit === 'string' ? jobData.cultureFit.split(',').map((s:string) => s.trim()) : jobData.cultureFit,
         active: true,
         postedAt: new Date().toISOString()
       };
       setJobs(prev => [newJob, ...prev]);
       alert("Vaga criada com sucesso! Mandato Tático gerado.");
    }
    setIsAddJobModalOpen(false);
    setEditingJob(undefined);
  };

  const handleSaveCandidate = (data: any) => {
    // Determine if we regenerate AI stats (only if archetype changes or new candidate)
    let aiAnalysis: any = {};
    let scores: BigFiveProfile = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, stability: 50 };
    
    // If editing and existing data is available, preserve it unless archetype changed
    if (editingCandidate && editingCandidate.archetype === data.archetype) {
       scores = editingCandidate.bigFive;
       aiAnalysis = {
           personalitySummary: editingCandidate.personalitySummary,
           likelyBehavior: editingCandidate.likelyBehavior,
           areaOfPotency: editingCandidate.areaOfPotency,
           subTraits: editingCandidate.subTraits,
           topSubTraits: editingCandidate.topSubTraits
       };
    } else {
       // Regenerate based on archetype choice
       // Mapping archetype string to likely scores (simplified for manual entry)
       if (data.archetype.includes("Hunter")) scores = { openness: 60, conscientiousness: 90, extraversion: 70, agreeableness: 40, stability: 90 };
       else if (data.archetype.includes("Closer")) scores = { openness: 65, conscientiousness: 85, extraversion: 90, agreeableness: 40, stability: 85 };
       else if (data.archetype.includes("Diplomata")) scores = { openness: 60, conscientiousness: 70, extraversion: 60, agreeableness: 95, stability: 75 };
       else if (data.archetype.includes("Consultor")) scores = { openness: 70, conscientiousness: 80, extraversion: 80, agreeableness: 80, stability: 80 };
       else scores = { openness: 85, conscientiousness: 60, extraversion: 70, agreeableness: 70, stability: 60 };

       aiAnalysis = generateAIAnalysis(scores, data.name);
    }

    const candidateData: Candidate = {
      id: editingCandidate ? editingCandidate.id : `c${Date.now()}`,
      ...data,
      skills: typeof data.skillsInput === 'string' ? data.skillsInput.split(',').map((s:string) => s.trim()) : data.skillsInput,
      avatarUrl: editingCandidate ? editingCandidate.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`,
      bigFive: scores,
      sincerityScore: editingCandidate ? editingCandidate.sincerityScore : 100, // Manual assume sincere
      ...aiAnalysis,
      challengeSubmission: editingCandidate?.challengeSubmission
    };

    if (editingCandidate) {
        setCandidates(prev => prev.map(c => c.id === candidateData.id ? candidateData : c));
        alert("Candidato atualizado com sucesso!");
    } else {
        setCandidates(prev => [candidateData, ...prev]);
        alert("Candidato adicionado com sucesso!");
    }
    
    setIsAddCandidateModalOpen(false);
    setEditingCandidate(undefined);
  };

  const handlePublicCandidateSubmit = (formData: any, scores: BigFiveProfile, challengeData: any) => {
    const analysis = generateAIAnalysis(scores, formData.fullName);
    const locationString = formData.locationState ? `${formData.locationCity} - ${formData.locationState}` : 'Remoto';
    const newCandidate: Candidate = {
       id: `c${Date.now()}`,
       name: formData.fullName,
       phone: formData.whatsapp,
       role: formData.role || 'SDR',
       seniority: 'Júnior',
       location: locationString,
       salaryExpectation: Number(formData.salaryExpectation),
       skills: [],
       avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random&color=fff`,
       resumeUrl: formData.fileName,
       bio: formData.pitch,
       bigFive: scores,
       sincerityScore: challengeData.sincerityScore || 80, // Catch passed score
       ...analysis,
       challengeSubmission: {
           ...challengeData,
           communicationScore: analysis.communicationScore || 7.5
       }
    };
    setCandidates(prev => [newCandidate, ...prev]);
  };

  const handleProfileClick = () => { if(confirm("Perfil de Ana Recrutadora\n\nDeseja fazer logout?")) alert("Logout realizado (Simulação)"); };
  const formatDate = (dateString: string) => { const date = new Date(dateString); return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date); }
  const getDeadlineColor = (dateString: string) => { const today = new Date(); const deadline = new Date(dateString); const diffTime = deadline.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); if (diffDays < 3) return 'bg-red-100 text-red-700 border-red-200'; if (diffDays < 7) return 'bg-orange-100 text-orange-700 border-orange-200'; return 'bg-brand-dark/5 text-brand-dark border-brand-dark/10'; };

  // Render Public
  if (isPublicMode) {
     return (
        <div className="h-screen bg-slate-50 flex flex-col">
           <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center font-bold text-white">D</div>
                 <span className="font-bold text-slate-700">DeuMatch <span className="text-brand-primary font-normal">| Carreiras</span></span>
              </div>
              <div className="text-xs text-slate-400">Processo Seletivo Unificado</div>
           </div>
           <div className="flex-1 overflow-y-auto">
              <OnboardingFlow onCandidateSubmit={handlePublicCandidateSubmit} onExitPublicMode={() => setIsPublicMode(false)} />
           </div>
        </div>
     );
  }

  // Render Recruiter
  return (
    <div className="flex h-screen overflow-hidden font-sans text-brand-dark bg-mesh">
      <aside className="w-20 lg:w-64 bg-sidebar-gradient text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-brand-secondary text-2xl">D</span>
            </div>
            <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-white">Deu<span className="text-white">Match</span></span>
        </div>
        <nav className="p-4 space-y-2 flex-1 mt-4">
          <button onClick={() => { setActiveTab('jobs'); setSelectedJobId(null); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === 'jobs' ? 'bg-white/20 text-white shadow-inner border border-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <Briefcase size={22} className={activeTab === 'jobs' ? 'text-white' : 'group-hover:text-white'} /> <span className="hidden lg:block">Vagas & Pipeline</span>
          </button>
          <button onClick={() => { setActiveTab('talent-pool'); setSelectedJobId(null); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === 'talent-pool' ? 'bg-white/20 text-white shadow-inner border border-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <Users size={22} className={activeTab === 'talent-pool' ? 'text-white' : 'group-hover:text-white'} /> <span className="hidden lg:block">Banco de Talentos</span>
          </button>
          <button onClick={() => { setActiveTab('onboarding'); setSelectedJobId(null); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === 'onboarding' ? 'bg-white/20 text-white shadow-inner border border-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <ClipboardList size={22} className={activeTab === 'onboarding' ? 'text-white' : 'group-hover:text-white'} /> <span className="hidden lg:block">Gestão de Talentos</span>
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleProfileClick} className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/10 border border-white/5 backdrop-blur-sm hover:bg-white/20 transition-colors text-left">
            <img src="https://ui-avatars.com/api/?name=Ana+R&background=fff&color=FF7F47" className="w-8 h-8 rounded-lg ring-2 ring-white/20" alt="User" />
            <div className="hidden lg:block overflow-hidden"><p className="text-sm font-bold text-white truncate">Ana Recrutadora</p><div className="flex items-center justify-between"><p className="text-xs text-white/70 truncate">Head of Talent</p><Settings size={12} className="text-white/70" /></div></div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-transparent h-screen">
        <header className="h-20 px-8 flex justify-between items-center glass-panel border-b-0 m-4 rounded-2xl z-10 shrink-0">
            <div><h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                {selectedJob ? (<><button onClick={() => { setSelectedJobId(null); setSearchQuery(''); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-brand-dark transition-colors"><ArrowLeft size={24} /></button><span className="text-slate-400 font-medium">Vagas /</span><span>{selectedJob.title}</span><div className={`ml-4 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${getDeadlineColor(selectedJob.deadline)}`}><CalendarClock size={14} /> Prazo: {formatDate(selectedJob.deadline)}</div></>) : (activeTab === 'jobs' ? 'Minhas Vagas' : activeTab === 'talent-pool' ? 'Banco de Talentos' : 'Gestão de Convites')}
            </h1></div>
            <div className="flex gap-4">
              {activeTab !== 'onboarding' && (<div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={activeTab === 'jobs' && !selectedJob ? "Buscar vaga..." : "Buscar candidato..."} className="pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-sm"/>{searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-dark"><X size={14} /></button>)}</div>)}
              {activeTab === 'jobs' && !selectedJob && (<button onClick={openAddJobModal} className="bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"><Plus size={18} strokeWidth={3} /> Nova Vaga</button>)}
              {activeTab === 'talent-pool' && (<button onClick={openAddCandidateModal} className="bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"><Plus size={18} strokeWidth={3} /> Novo Candidato</button>)}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTab === 'onboarding' && <RecruiterDashboard candidates={candidates} onViewCandidate={(c) => setCandidateDetail({ candidate: c })} onOpenPublicLink={() => setIsPublicMode(true)} />}
          
          {activeTab === 'jobs' && !selectedJob && (
             <>
                 <div className="flex items-center gap-2 mb-4 px-2">
                     <div className="flex items-center gap-2 bg-white/60 p-1.5 rounded-lg border border-slate-200">
                         <MapPin size={14} className="text-slate-400 ml-1"/>
                         <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none">
                             <option value="">Brasil</option>
                             {statesList.map(s => <option key={s.id} value={s.sigla}>{s.sigla}</option>)}
                         </select>
                         {availableCities.length > 0 && (
                            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none border-l border-slate-300 pl-2">
                                <option value="">Todas Cidades</option>
                                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         )}
                     </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredJobs.map(job => <JobCard key={job.id} job={job} selected={false} onClick={() => { setSelectedJobId(job.id); setJobViewMode('details'); setSearchQuery(''); }} onEdit={openEditJobModal} />)}
                    {filteredJobs.length === 0 && <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400"><Search size={48} className="mb-4 opacity-20" /><p>Nenhuma vaga encontrada.</p></div>}
                 </div>
             </>
          )}

          {activeTab === 'jobs' && selectedJob && (
             <div className="space-y-6 h-full flex flex-col">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-0">
                    <button onClick={() => setJobViewMode('details')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all ${jobViewMode === 'details' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}>Sobre a Vaga</button>
                    <button onClick={() => setJobViewMode('pipeline')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${jobViewMode === 'pipeline' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}>Pipeline <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] border border-slate-200">{pipelineCandidates.length}</span></button>
                    <button onClick={() => setJobViewMode('matches')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${jobViewMode === 'matches' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}>Match de Talentos <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] border border-slate-200"><Sparkles size={8} className="inline text-brand-primary" /></span></button>
                </div>
                {jobViewMode === 'details' && (
                    <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Replaced inline Job Details with reusable component */}
                        <JobDetailView job={selectedJob} onEdit={openEditJobModal} />
                    </div>
                )}
                {jobViewMode === 'pipeline' && (
                    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div><h3 className="text-lg font-bold text-brand-dark">Pipeline</h3><p className="text-xs text-slate-500">Arraste os cards.</p></div>
                            <div className="flex gap-2"><button onClick={() => setShowKanbanFilters(!showKanbanFilters)} className={`text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${showKanbanFilters ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-white border-brand-dark/20 text-brand-dark hover:bg-brand-dark/5'}`}><Filter size={12} /> Filtros</button></div>
                        </div>
                        <div className="flex-1 flex gap-6 overflow-hidden">
                            <div className="flex-1 overflow-hidden h-full"><KanbanBoard candidates={pipelineCandidates as any[]} onMoveCandidate={handleMoveCandidate} onCardClick={(candidate, match) => setCandidateDetail({ candidate, match })} /></div>
                            <div className="w-80 border-l border-slate-200 pl-6 bg-slate-50/50 p-4 overflow-y-auto hidden xl:block"><div className="mb-4"><h4 className="font-bold text-brand-dark flex items-center gap-2 text-sm"><Sparkles size={16} className="text-brand-primary" /> Sugestões de IA</h4><p className="text-xs text-slate-500 mt-1">Match tech/cultural fora do pipeline.</p></div><div className="space-y-3">{aiSuggestions.map(item => (<div key={item.candidate.id} className="relative group"><CandidateCard candidate={item.candidate} matchResult={item.match} variant="kanban" onClick={() => setCandidateDetail({ candidate: item.candidate, match: item.match })} /><button onClick={(e) => { e.stopPropagation(); handleAddToPipeline(item.candidate.id); }} className="absolute right-2 top-2 bg-brand-primary text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110" title="Adicionar"><Plus size={12} strokeWidth={3} /></button></div>))}{aiSuggestions.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Sem sugestões.</p>}</div></div>
                        </div>
                    </div>
                )}
                {jobViewMode === 'matches' && (
                    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <TalentMatchView 
                            job={selectedJob} 
                            candidates={candidates} 
                            onAddToPipeline={handleAddToPipeline}
                            onViewProfile={(c) => setCandidateDetail({ candidate: c, match: calculateMatch(c, selectedJob) })}
                        />
                    </div>
                )}
             </div>
          )}

          {activeTab === 'talent-pool' && (
            <div className="h-full overflow-y-auto no-scrollbar pb-20">
               <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#f8fafc] z-10 py-2">
                 <p className="text-slate-500 text-sm">Mostrando <span className="font-bold text-brand-dark">{filteredTalents.length}</span> profissionais.</p>
                 <div className="flex gap-2 items-center flex-wrap justify-end">
                   <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                      <MapPin size={14} className="text-slate-400 ml-1"/>
                      <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none">
                          <option value="">UF</option>
                          {statesList.map(s => <option key={s.id} value={s.sigla}>{s.sigla}</option>)}
                      </select>
                      {availableCities.length > 0 && (
                        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none border-l border-slate-200 pl-2 max-w-[100px]">
                            <option value="">Cidade</option>
                            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                   </div>
                   <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center gap-1 mr-2">
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-brand-dark' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-brand-dark' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
                   </div>
                   <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none cursor-pointer hover:border-slate-300"><option value="">Todos Cargos</option><option value="SDR">SDR</option><option value="Account Executive">Account Executive</option><option value="CS">CS</option><option value="Sales Manager">Sales Manager</option></select>
                   <select value={seniorityFilter} onChange={(e) => setSeniorityFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none cursor-pointer hover:border-slate-300"><option value="">Toda Senioridade</option><option value="Júnior">Júnior</option><option value="Pleno">Pleno</option><option value="Sênior">Sênior</option></select>
                 </div>
               </div>
               {viewMode === 'grid' ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredTalents.map(candidate => <CandidateCard key={candidate.id} candidate={candidate} matchResult={undefined} variant="summary" onClick={() => setCandidateDetail({ candidate })} onEdit={openEditCandidateModal} />)}
                  {filteredTalents.length === 0 && <div className="col-span-full py-12 text-center text-slate-400">Nenhum talento encontrado.</div>}
                </div>
               ) : (
                 <div className="flex flex-col gap-2">
                   <div className="flex px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider"><div className="w-1/3 min-w-[200px]">Candidato</div><div className="w-1/4">Função</div><div className="w-1/4 hidden md:block">Skills</div><div className="flex-1 text-right">Ações</div></div>
                   {filteredTalents.map(candidate => <CandidateCard key={candidate.id} candidate={candidate} matchResult={undefined} variant="list" onClick={() => setCandidateDetail({ candidate })} onEdit={openEditCandidateModal} actions={<button onClick={(e) => { e.stopPropagation(); handleInviteClick(candidate); }} className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors font-medium text-xs">Convidar</button>} />)}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={!!candidateDetail} onClose={() => setCandidateDetail(null)} title="" size="6xl">
         {candidateDetail && (
            <CandidateCard 
                candidate={candidateDetail.candidate} 
                matchResult={candidateDetail.match} 
                variant="detail" 
                onJobClick={(jobId) => {
                    // Logic to open Job Preview in "Add Candidate Mode"
                    const job = jobs.find(j => j.id === jobId);
                    if (job) {
                        setPreviewJobContext({ job, candidate: candidateDetail.candidate });
                    }
                }} 
                onEdit={(c) => { setCandidateDetail(null); openEditCandidateModal(c); }} 
            />
         )}
      </Modal>

      {/* New Modal for Job Preview Context */}
      <Modal isOpen={!!previewJobContext} onClose={() => setPreviewJobContext(null)} title={previewJobContext?.job.title || "Detalhes da Vaga"} size="4xl">
         {previewJobContext && (
             <JobDetailView 
                job={previewJobContext.job} 
                candidate={previewJobContext.candidate}
                onAddCandidate={confirmAddFromPreview}
                onCancel={() => setPreviewJobContext(null)}
             />
         )}
      </Modal>

      <Modal isOpen={isAddJobModalOpen} onClose={() => setIsAddJobModalOpen(false)} title={editingJob ? "Editar Vaga" : "Nova Vaga"} size="4xl"><AddJobForm initialData={editingJob} onSave={handleSaveJob} onCancel={() => setIsAddJobModalOpen(false)} /></Modal>
      <Modal isOpen={isAddCandidateModalOpen} onClose={() => setIsAddCandidateModalOpen(false)} title={editingCandidate ? "Editar Candidato" : "Novo Candidato"} size="4xl"><AddCandidateForm initialData={editingCandidate} onSave={handleSaveCandidate} onCancel={() => setIsAddCandidateModalOpen(false)} /></Modal>
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Convidar Candidato" size="sm"><div className="text-center"><h3 className="font-bold text-lg mb-2">Convidar para Vaga?</h3><p className="text-slate-600 mb-6 text-sm">Deseja convidar <strong>{candidateToInvite?.name}</strong> para <strong>{selectedJob?.title}</strong>?</p><div className="flex gap-3 justify-center"><button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-bold">Cancelar</button><button onClick={() => selectedJob && confirmInvite(selectedJob.id)} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold">Confirmar</button></div></div></Modal>
    </div>
  );
};

export default App;
