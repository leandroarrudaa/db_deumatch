
import React, { useState, useEffect } from 'react';
import { Role, Seniority, Job } from '../types';
import { 
    Briefcase, MapPin, DollarSign, FileText, Building, 
    Globe, Instagram, Calendar, Box, UserCheck, Target,
    ArrowRight, ArrowLeft, CheckCircle, Dna, Sword, Zap, 
    Layers, Users, Trophy, Wallet, Crosshair
} from 'lucide-react';
import { fetchStates, fetchCities, State } from '../services/locations';

interface AddJobFormProps {
  initialData?: Job; 
  onSave: (job: any) => void;
  onCancel: () => void;
}

// Gamified Types
type Step = 1 | 2 | 3;

// --- UI HELPERS (DEFINIDOS FORA PARA EVITAR RE-RENDER E PERDA DE FOCO) ---

const InputGroup = ({ label, icon: Icon, children }: any) => (
  <div className="group relative">
      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest group-focus-within:text-brand-primary transition-colors flex items-center gap-1.5">
          {label}
      </label>
      <div className="relative">
          {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors z-10" size={18} />}
          {children}
      </div>
      {/* Animated Line */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-brand-primary w-0 group-focus-within:w-full transition-all duration-500"></div>
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
      {...props} 
      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all duration-300 hover:bg-white"
  />
);

const StyledTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
      {...props} 
      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all duration-300 hover:bg-white resize-none"
  />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
      {...props} 
      className="w-full pl-3 pr-8 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all duration-300 cursor-pointer appearance-none hover:bg-white"
  />
);

const OptionCard = ({ label, icon: Icon, selected, onClick }: any) => (
    <button 
      type="button"
      onClick={onClick}
      className={`
          relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 w-full h-full min-h-[120px]
          ${selected 
              ? `bg-white border-brand-primary shadow-[0_10px_30px_-10px_rgba(255,127,71,0.3)] transform -translate-y-1 z-10` 
              : 'bg-white/50 border-slate-100 hover:border-slate-300 hover:bg-white text-slate-400'
          }
      `}
    >
      <div className={`p-3 rounded-full transition-colors ${selected ? 'bg-brand-gradient text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
          <Icon size={24} strokeWidth={selected ? 2.5 : 2} />
      </div>
      <span className={`text-xs font-black uppercase tracking-wide text-center ${selected ? 'text-brand-dark' : 'text-slate-500'}`}>{label}</span>
      
      {selected && (
          <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
              <CheckCircle size={16} fill="#FF7F47" className="text-white" />
          </div>
      )}
    </button>
);

export const AddJobForm: React.FC<AddJobFormProps> = ({ initialData, onSave, onCancel }) => {
  
  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  const parseLocation = (loc: string) => {
    if (!loc) return { state: '', city: '' };
    const parts = loc.split('-');
    if (parts.length > 1) {
        return { city: parts[0].trim(), state: parts[1].trim() };
    }
    return { state: '', city: loc };
  };

  const initialLoc = initialData ? parseLocation(initialData.location) : { state: '', city: '' };

  const [formData, setFormData] = useState({
    // Step 1: DNA (Mission DNA)
    title: '',
    company: 'Sua Empresa',
    companyDescription: '',
    productSolution: '',
    icp: '',
    website: '',
    instagram: '',
    
    // Step 2: Battlefield (Profile, Stack, Role)
    role: 'SDR' as Role,
    seniority: 'Pleno' as Seniority,
    state: initialLoc.state,
    city: initialLoc.city,
    idealProfile: '',
    skillsInput: '',
    challengesInput: '', // New visual field for challenges
    
    // Step 3: Reward & Routine
    salaryMin: '',
    salaryMax: '',
    compensationDetails: '',
    deadline: '',
    description: '',
    cultureInput: '',
  });

  const [statesList, setStatesList] = useState<State[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Calculate "XP" (Form Completion)
  const calculateXP = () => {
      const fields = Object.values(formData);
      const filled = fields.filter(f => f && f.toString().length > 0).length;
      return Math.round((filled / fields.length) * 100);
  };
  const xp = calculateXP();

  // --- DATA LOADING ---
  useEffect(() => {
    const loadStates = async () => {
        const states = await fetchStates();
        setStatesList(states);
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (initialData) {
        const loc = parseLocation(initialData.location);
        setFormData(prev => ({
            ...prev,
            title: initialData.title,
            company: initialData.company,
            role: initialData.role,
            seniority: initialData.seniority,
            salaryMin: initialData.salaryRange[0].toString(),
            salaryMax: initialData.salaryRange[1].toString(),
            description: initialData.description,
            companyDescription: initialData.companyDescription,
            productSolution: initialData.productSolution || '',
            idealProfile: initialData.idealProfile || '',
            icp: initialData.icp || '',
            skillsInput: initialData.requiredSkills.join(', '),
            cultureInput: initialData.cultureFit.join(', '),
            challengesInput: initialData.challenges.join(', '),
            deadline: initialData.deadline,
            website: initialData.website || '',
            instagram: initialData.instagram || '',
            compensationDetails: initialData.compensationDetails || '',
            state: loc.state,
            city: loc.city
        }));
    }
  }, [initialData]);

  useEffect(() => {
    const loadCities = async () => {
        if (formData.state) {
            setIsLoadingCities(true);
            const cities = await fetchCities(formData.state);
            setAvailableCities(cities);
            if (formData.city && !cities.includes(formData.city)) {
                 setFormData(prev => ({ ...prev, city: '' }));
            }
            setIsLoadingCities(false);
        } else {
            setAvailableCities([]);
        }
    };
    loadCities();
  }, [formData.state]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role: Role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSenioritySelect = (seniority: Seniority) => {
    setFormData(prev => ({ ...prev, seniority }));
  };

  const nextStep = () => {
      // Basic Validation
      if (currentStep === 1 && (!formData.title || !formData.company)) {
          alert("Soldado! Precisamos do Título da Missão e da Empresa para avançar.");
          return;
      }
      if (currentStep === 2 && (!formData.state || !formData.city)) {
          alert("Defina o Local da Batalha (Estado e Cidade).");
          return;
      }
      setDirection('forward');
      setCurrentStep(prev => Math.min(prev + 1, 3) as Step);
      // Scroll to top
      const scrollContainer = document.querySelector('.custom-scrollbar');
      if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
      setDirection('backward');
      setCurrentStep(prev => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationString = formData.state ? `${formData.city} - ${formData.state}` : formData.city || 'Remoto';
    
    // Convert comma strings to arrays
    const skillsArray = formData.skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const challengesArray = formData.challengesInput.split(',').map(s => s.trim()).filter(Boolean);
    const cultureArray = formData.cultureInput.split(',').map(s => s.trim()).filter(Boolean);

    onSave({
      ...initialData,
      title: formData.title,
      company: formData.company,
      role: formData.role,
      seniority: formData.seniority,
      location: locationString,
      description: formData.description,
      companyDescription: formData.companyDescription || 'Empresa confidencial.',
      productSolution: formData.productSolution,
      idealProfile: formData.idealProfile,
      icp: formData.icp,
      salaryRange: [Number(formData.salaryMin), Number(formData.salaryMax)],
      website: formData.website,
      instagram: formData.instagram,
      compensationDetails: formData.compensationDetails || 'A combinar',
      deadline: formData.deadline,
      requiredSkills: skillsArray,
      challenges: challengesArray,
      cultureFit: cultureArray
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 relative overflow-hidden font-sans">
        
        {/* --- TOP NAV: XP BAR & STEPS --- */}
        <div className="pt-8 px-8 pb-4 flex flex-col items-center relative z-20 bg-white/50 backdrop-blur-sm border-b border-white/50">
            
            {/* XP Bar (Micro-interaction) */}
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-1000 ease-out" style={{ width: `${xp}%` }}></div>
            
            <div className="flex justify-between items-center w-full max-w-4xl mb-6">
                 {/* Steps Indicator */}
                 <div className="flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= currentStep ? 'bg-brand-primary' : 'bg-slate-200'}`}></div>
                    ))}
                 </div>
                 
                 {/* XP Badge */}
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full text-white text-[10px] font-bold shadow-lg">
                    <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                    <span>XP DA VAGA: {xp}%</span>
                 </div>
            </div>

            <div className="text-center">
                <h2 className="text-3xl font-black text-brand-dark tracking-tighter flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2">
                    {currentStep === 1 && <><Dna className="text-brand-primary" size={28} /> DNA DA MISSÃO</>}
                    {currentStep === 2 && <><Sword className="text-brand-primary" size={28} /> CAMPO DE BATALHA</>}
                    {currentStep === 3 && <><Trophy className="text-brand-primary" size={28} /> RECOMPENSA & ROTINA</>}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Configure os parâmetros táticos para a IA encontrar o candidato perfeito.
                </p>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 pb-32 pt-8">
            <form className="max-w-5xl mx-auto w-full relative">
                
                {/* STEP 1: DNA */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                        {/* Title & Company */}
                        <div className="bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup label="Título da Missão (Vaga)" icon={Briefcase}>
                                    <StyledInput name="title" value={formData.title} onChange={handleChange} placeholder="Ex: SDR Outbound - SaaS" autoFocus />
                                </InputGroup>
                                <InputGroup label="Nome da Organização" icon={Building}>
                                    <StyledInput name="company" value={formData.company} onChange={handleChange} placeholder="Sua Empresa" />
                                </InputGroup>
                            </div>
                        </div>

                        {/* Context & Pitch */}
                        <div className="bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 space-y-8 hover:shadow-xl transition-all duration-500">
                            <InputGroup label="Pitch Institucional (Cultura & Visão)" icon={Dna}>
                                <StyledTextArea name="companyDescription" value={formData.companyDescription} onChange={handleChange} rows={3} placeholder="Descreva a missão da empresa..." />
                            </InputGroup>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup label="Armamento (Produto/Solução)" icon={Box}>
                                    <StyledTextArea name="productSolution" value={formData.productSolution} onChange={handleChange} rows={3} placeholder="O que vendemos?" />
                                </InputGroup>
                                <InputGroup label="Alvo (ICP - Quem compramos)" icon={Target}>
                                    <StyledTextArea name="icp" value={formData.icp} onChange={handleChange} rows={3} placeholder="Perfil de cliente ideal..." />
                                </InputGroup>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup label="Website" icon={Globe}>
                                    <StyledInput name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                                </InputGroup>
                                <InputGroup label="Instagram" icon={Instagram}>
                                    <StyledInput name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@empresa" />
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: BATTLEFIELD */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                         {/* Role & Seniority Cards */}
                         <div className="bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 hover:shadow-xl transition-all duration-500">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Classe do Soldado</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <OptionCard label="SDR (Hunter)" icon={Target} selected={formData.role === 'SDR'} onClick={() => handleRoleSelect('SDR')} />
                                        <OptionCard label="Closer (AE)" icon={Zap} selected={formData.role === 'Account Executive'} onClick={() => handleRoleSelect('Account Executive')} />
                                        <OptionCard label="Farmer (CS)" icon={Users} selected={formData.role === 'CS'} onClick={() => handleRoleSelect('CS')} />
                                        <OptionCard label="Líder" icon={Trophy} selected={formData.role === 'Sales Manager'} onClick={() => handleRoleSelect('Sales Manager')} />
                                    </div>
                                </div>

                                {/* Seniority & Location */}
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Nível de Patente</label>
                                        <div className="flex gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                                            {['Júnior', 'Pleno', 'Sênior'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => handleSenioritySelect(s as Seniority)}
                                                    className={`
                                                        flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all
                                                        ${formData.seniority === s 
                                                            ? 'bg-brand-dark text-white shadow-lg transform scale-105' 
                                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white'}
                                                    `}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Base de Operações (Local)</label>
                                        <div className="flex gap-3">
                                            <div className="w-1/3">
                                                <StyledSelect name="state" value={formData.state} onChange={handleChange}>
                                                    <option value="">UF</option>
                                                    {statesList.map(st => <option key={st.id} value={st.sigla}>{st.sigla}</option>)}
                                                </StyledSelect>
                                            </div>
                                            <div className="flex-1">
                                                <StyledSelect name="city" value={formData.city} onChange={handleChange} disabled={!formData.state || isLoadingCities}>
                                                    <option value="">{isLoadingCities ? '...' : 'Cidade'}</option>
                                                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                                </StyledSelect>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                         </div>

                         {/* Profile & Skills */}
                         <div className="bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 space-y-8 hover:shadow-xl transition-all duration-500">
                            <InputGroup label="Avatar do Combatente (Perfil Ideal)" icon={UserCheck}>
                                <StyledTextArea name="idealProfile" value={formData.idealProfile} onChange={handleChange} rows={4} placeholder="Descreva comportamentos e hard skills..." />
                            </InputGroup>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup label="Arsenal (Tech Stack)" icon={Layers}>
                                    <StyledInput name="skillsInput" value={formData.skillsInput} onChange={handleChange} placeholder="Ex: Salesforce, HubSpot, LinkedIn..." />
                                </InputGroup>
                                <InputGroup label="Desafios do Terreno" icon={Crosshair}>
                                    <StyledInput name="challengesInput" value={formData.challengesInput} onChange={handleChange} placeholder="Ex: Ciclo longo, Prospecção fria..." />
                                </InputGroup>
                            </div>
                         </div>
                    </div>
                )}

                {/* STEP 3: REWARD & ROUTINE */}
                {currentStep === 3 && (
                     <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                         {/* Money & Terms */}
                         <div className="bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 hover:shadow-xl transition-all duration-500">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                 <InputGroup label="Salário Mínimo (R$)" icon={DollarSign}>
                                     <StyledInput type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} placeholder="0,00" />
                                 </InputGroup>
                                 <InputGroup label="Salário Máximo (R$)" icon={DollarSign}>
                                     <StyledInput type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} placeholder="0,00" />
                                 </InputGroup>
                             </div>
                             
                             <div className="space-y-8">
                                <InputGroup label="Detalhes da Comissão & Benefícios" icon={Wallet}>
                                    <StyledTextArea name="compensationDetails" value={formData.compensationDetails} onChange={handleChange} rows={3} placeholder="Variável, bônus, equity..." />
                                </InputGroup>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputGroup label="Prazo da Missão (Deadline)" icon={Calendar}>
                                        <StyledInput type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                                    </InputGroup>
                                    <InputGroup label="Fit Cultural (Tribo)" icon={Users}>
                                        <StyledInput name="cultureInput" value={formData.cultureInput} onChange={handleChange} placeholder="Ex: Faca na caveira, Data-driven..." />
                                    </InputGroup>
                                </div>
                             </div>
                         </div>

                         {/* Briefing Text */}
                         <div className="bg-white p-10 rounded-[24px] shadow-sm border border-slate-200/60 hover:shadow-xl transition-all duration-500">
                             <InputGroup label="Briefing Tático Completo (Descrição)" icon={FileText}>
                                 <StyledTextArea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Detalhes adicionais da vaga..." />
                             </InputGroup>
                         </div>
                     </div>
                )}

            </form>
        </div>

        {/* --- BOTTOM ACTION BAR --- */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 z-30">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                
                <button 
                    onClick={currentStep === 1 ? onCancel : prevStep}
                    className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm"
                >
                    {currentStep === 1 ? 'Cancelar Missão' : <><ArrowLeft size={18} /> Voltar</>}
                </button>

                {currentStep < 3 ? (
                    <button 
                        onClick={nextStep}
                        className="px-8 py-4 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm group"
                    >
                        Próxima Etapa <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        className="px-10 py-4 bg-brand-gradient text-white rounded-xl font-bold shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                    >
                        <CheckCircle size={18} /> Publicar Vaga
                    </button>
                )}
            </div>
        </div>

    </div>
  );
};
