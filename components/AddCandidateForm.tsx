
import React, { useState, useEffect } from 'react';
import { Role, Seniority, Candidate } from '../types';
import { User, DollarSign, Phone, BrainCircuit, FileText } from 'lucide-react';
import { fetchStates, fetchCities, State } from '../services/locations';

interface AddCandidateFormProps {
  initialData?: Candidate;
  onSave: (candidate: any) => void;
  onCancel: () => void;
}

const ARCHETYPES = [
  { id: 'Hunter Resiliente', label: 'Hunter Resiliente (Foco em Volume/Prospecção)' },
  { id: 'Closer Estratégico', label: 'Closer Estratégico (Foco em Negociação)' },
  { id: 'Diplomata Empática', label: 'Diplomata (Foco em CS/Relacionamento)' },
  { id: 'Consultora de Relacionamento', label: 'Consultor (Venda Consultiva)' },
  { id: 'Aprendiz Ágil', label: 'Aprendiz Ágil (Júnior com alto potencial)' }
];

export const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ initialData, onSave, onCancel }) => {
  
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
    name: '',
    role: 'SDR' as Role,
    seniority: 'Júnior' as Seniority,
    salaryExpectation: '',
    phone: '',
    bio: '',
    skillsInput: '',
    archetype: 'Hunter Resiliente',
    state: initialLoc.state,
    city: initialLoc.city
  });

  const [statesList, setStatesList] = useState<State[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Load States
  useEffect(() => {
    const loadStates = async () => {
        const states = await fetchStates();
        setStatesList(states);
    };
    loadStates();
  }, []);

  // Pre-fill data if editing
  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            name: initialData.name,
            role: initialData.role,
            seniority: initialData.seniority,
            salaryExpectation: initialData.salaryExpectation.toString(),
            phone: initialData.phone,
            bio: initialData.bio,
            skillsInput: initialData.skills.join(', '),
            archetype: initialData.archetype
        }));
    }
  }, [initialData]);

  // Update cities when state changes
  useEffect(() => {
    const loadCities = async () => {
        if (formData.state) {
            setIsLoadingCities(true);
            const cities = await fetchCities(formData.state);
            setAvailableCities(cities);
            
            // If current city is not in new state list, clear it (unless it was initial load)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationString = formData.state ? `${formData.city} - ${formData.state}` : formData.city || 'Remoto';

    onSave({
      ...(initialData || {}), // Preserve ID and other fields if editing
      name: formData.name,
      role: formData.role,
      seniority: formData.seniority,
      location: locationString,
      salaryExpectation: Number(formData.salaryExpectation),
      phone: formData.phone,
      bio: formData.bio,
      skillsInput: formData.skillsInput,
      archetype: formData.archetype,
      // Logic for new vs edit: handled in App.tsx
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-slate-800">
      
      {/* 2-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1 */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-black text-brand-primary uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">1. Dados Pessoais</h4>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ex: João Silva" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="119..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Localização</label>
                            <div className="grid grid-cols-3 gap-2">
                              <select name="state" value={formData.state} onChange={handleChange} className="col-span-1 px-2 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none">
                                <option value="">UF</option>
                                {statesList.map(st => (<option key={st.id} value={st.sigla}>{st.sigla}</option>))}
                              </select>
                              
                              <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state || isLoadingCities} className="col-span-2 px-2 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">{isLoadingCities ? '...' : 'Cidade'}</option>
                                {availableCities.map(city => (<option key={city} value={city}>{city}</option>))}
                              </select>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <label className="block text-sm font-bold text-brand-primary mb-3 flex items-center gap-2"><BrainCircuit size={20} /> Arquétipo Comportamental</label>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                   {initialData 
                     ? "Alterar o arquétipo redefinirá as pontuações Big Five baseadas na IA. Mantenha o atual se não quiser alterar o perfil psicológico." 
                     : "O sistema gera automaticamente o perfil Big Five e as previsões de performance baseadas na escolha abaixo."}
                </p>
                <select name="archetype" value={formData.archetype} onChange={handleChange} className="w-full px-4 py-4 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 bg-white font-bold text-slate-900 shadow-sm">
                    {ARCHETYPES.map(arc => (<option key={arc.id} value={arc.id}>{arc.label}</option>))}
                </select>
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
                <h4 className="text-sm font-black text-brand-primary uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">2. Perfil Profissional</h4>
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Cargo</label><select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none"><option value="SDR">SDR</option><option value="BDR">BDR</option><option value="Account Executive">Account Executive</option><option value="Closer">Closer</option><option value="Farmer">Farmer</option><option value="CS">CS</option><option value="Head Comercial">Head Comercial</option><option value="Sales Manager">Sales Manager</option><option value="Sales Ops">Sales Ops</option><option value="RevOps">RevOps</option><option value="COO">COO</option></select></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Senioridade</label><select name="seniority" value={formData.seniority} onChange={handleChange} className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none"><option value="Júnior">Júnior</option><option value="Pleno">Pleno</option><option value="Sênior">Sênior</option></select></div>
                </div>
                <div className="mb-5"><label className="block text-xs font-bold text-slate-700 mb-1.5">Pretensão Salarial (R$)</label><div className="relative"><DollarSign className="absolute left-3 top-3 text-slate-400" size={18} /><input type="number" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleChange} placeholder="Ex: 5000" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none font-medium"/></div></div>
                <div className="mb-5"><label className="block text-xs font-bold text-slate-700 mb-1.5">Skills (Tags)</label><input name="skillsInput" value={formData.skillsInput} onChange={handleChange} placeholder="Ex: Vendas Consultivas, CRM, Prospecção" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none"/></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Mini Bio / Resumo</label><div className="relative"><FileText className="absolute left-3 top-3 text-slate-400" size={18} /><textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Resumo breve..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand-primary outline-none resize-none"/></div></div>
          </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="w-1/3 py-4 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
        <button type="submit" className="w-2/3 py-4 bg-brand-gradient text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg text-lg">
            {initialData ? 'Salvar Alterações' : 'Adicionar Candidato'}
        </button>
      </div>
    </form>
  );
};
