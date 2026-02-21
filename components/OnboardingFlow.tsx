
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, DollarSign, Upload, Linkedin, 
  ArrowRight, CheckCircle, BrainCircuit, Briefcase, 
  FileText, ChevronRight, ChevronLeft, Send,
  Mic, Square, Play, Pause, AlertTriangle, RefreshCw
} from 'lucide-react';
import { fetchStates, fetchCities, State } from '../services/locations';
import { getRandomChallenge } from '../services/roleChallenges';
import { BigFiveProfile } from '../types';

// --- QUESTIONS DATABASE CONFIGURATION ---
// Total: 30 Questions to fit 5 pages of 6.
// Logic includes:
// 1. Inverted items (e.g., "I am lazy" -> Low Conscientiousness)
// 2. Control items (Social Desirability / Lie Scale)

type TraitType = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'stability' | 'control';

interface QuestionConfig {
  text: string;
  trait: TraitType;
  isInverted?: boolean;
}

const PSYCHOMETRIC_QUESTIONS: QuestionConfig[] = [
  // Page 1
  { text: "Busco constantemente novas ferramentas e métodos para vender melhor.", trait: 'openness' },
  { text: "Sigo o processo de vendas (cadência) à risca, sem pular etapas.", trait: 'conscientiousness' },
  { text: "Geralmente inicio conversas com pessoas desconhecidas.", trait: 'extraversion' },
  { text: "Tenho pouca paciência com clientes indecisos.", trait: 'agreeableness', isInverted: true }, // Inverted
  { text: "Fico estressado facilmente com metas agressivas.", trait: 'stability', isInverted: true }, // Inverted
  { text: "Nunca senti inveja de ninguém em toda minha vida.", trait: 'control' }, // Trap: Lie Scale

  // Page 2
  { text: "Prefiro tarefas rotineiras a ter que aprender algo novo todo dia.", trait: 'openness', isInverted: true }, // Inverted
  { text: "Mantenho meu CRM impecavelmente atualizado todos os dias.", trait: 'conscientiousness' },
  { text: "Sinto-me energizado após passar o dia falando com clientes.", trait: 'extraversion' },
  { text: "Preocupo-me genuinamente com o problema do cliente, não só com a comissão.", trait: 'agreeableness' },
  { text: "Consigo manter a calma mesmo quando o cliente é agressivo.", trait: 'stability' },
  { text: "Sempre cumpri 100% das promessas que fiz, sem exceção.", trait: 'control' }, // Trap: Lie Scale

  // Page 3
  { text: "Gosto de testar abordagens diferentes, mesmo que as atuais funcionem.", trait: 'openness' },
  { text: "Deixo as coisas para a última hora com frequência.", trait: 'conscientiousness', isInverted: true }, // Inverted
  { text: "Sou uma pessoa reservada e quieta.", trait: 'extraversion', isInverted: true }, // Inverted
  { text: "Evito conflitos desnecessários com clientes, buscando o ganha-ganha.", trait: 'agreeableness' },
  { text: "Raramente levo problemas do trabalho para o lado pessoal.", trait: 'stability' },
  { text: "Nunca falei mal de ninguém pelas costas.", trait: 'control' }, // Trap: Lie Scale

  // Page 4
  { text: "Tenho dificuldade para entender tecnologias complexas.", trait: 'openness', isInverted: true }, // Inverted
  { text: "Defino metas pessoais acima das metas da empresa.", trait: 'conscientiousness' },
  { text: "Gosto de ser o centro das atenções em apresentações.", trait: 'extraversion' },
  { text: "Desconfio das intenções das pessoas inicialmente.", trait: 'agreeableness', isInverted: true }, // Inverted
  { text: "Meu humor oscila bastante durante o dia.", trait: 'stability', isInverted: true }, // Inverted
  { text: "Sempre sei exatamente o que dizer em qualquer situação.", trait: 'control' }, // Trap: Lie Scale

  // Page 5
  { text: "Vejo objeções de clientes como oportunidades criativas.", trait: 'openness' },
  { text: "Planejo meu dia de trabalho com antecedência.", trait: 'conscientiousness' },
  { text: "Prefiro trabalhar sozinho a trabalhar em equipe.", trait: 'extraversion', isInverted: true }, // Inverted
  { text: "Colegas costumam me procurar para pedir ajuda ou conselhos.", trait: 'agreeableness' },
  { text: "Não me abalo emocionalmente com um 'não' agressivo.", trait: 'stability' },
  { text: "Nunca adiei uma tarefa que precisava fazer.", trait: 'control' } // Trap: Lie Scale
];

interface OnboardingFlowProps {
  onCandidateSubmit: (data: any, scores: BigFiveProfile, challengeData: any) => void;
  onExitPublicMode?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onCandidateSubmit, onExitPublicMode }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // --- STEP 1 STATE ---
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    role: '',
    linkedin: '',
    salaryExpectation: '',
    locationState: '',
    locationCity: '',
    pitch: '',
    fileName: ''
  });
  
  // Locations Data
  const [statesList, setStatesList] = useState<State[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // --- STEP 2 STATE ---
  const [answers, setAnswers] = useState<number[]>(new Array(30).fill(0));
  const [currentQuestionBlock, setCurrentQuestionBlock] = useState(0);

  // --- STEP 3 STATE (CHALLENGE) ---
  const [activeChallenge, setActiveChallenge] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isChallengeStarted, setIsChallengeStarted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // --- EFFECTS ---
  
  // Load States on Mount
  useEffect(() => {
    const loadStates = async () => {
      const states = await fetchStates();
      setStatesList(states);
    };
    loadStates();
  }, []);

  // Load Cities when State changes
  useEffect(() => {
    const loadCities = async () => {
      if (formData.locationState) {
        setIsLoadingCities(true);
        const cities = await fetchCities(formData.locationState);
        setCitiesList(cities);
        setFormData(prev => ({ ...prev, locationCity: '' })); // Reset city
        setIsLoadingCities(false);
      } else {
        setCitiesList([]);
      }
    };
    loadCities();
  }, [formData.locationState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- HANDLERS ---

  const handlePhoneMask = (val: string) => {
    return val.replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      setFormData(prev => ({ ...prev, [name]: handlePhoneMask(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, fileName: e.target.files![0].name }));
    }
  };

  const handleLikertChange = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  // --- SCORE CALCULATION LOGIC ---
  const calculateResults = () => {
    const traits: Record<TraitType, number[]> = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      stability: [],
      control: []
    };

    // Iterate through all answers and distribute to traits
    PSYCHOMETRIC_QUESTIONS.forEach((config, idx) => {
      let score = answers[idx];
      
      // Handle Inverted Questions (5 becomes 1, 1 becomes 5)
      if (config.isInverted) {
        score = 6 - score;
      }
      
      traits[config.trait].push(score);
    });

    // Helper to calc average percentage
    const calcAvg = (scores: number[]) => {
      if (scores.length === 0) return 50;
      const sum = scores.reduce((a, b) => a + b, 0);
      const maxPossible = scores.length * 5;
      const minPossible = scores.length * 1;
      // Normalizing to 0-100 scale
      return Math.round(((sum - minPossible) / (maxPossible - minPossible)) * 100);
    };

    const bigFiveScores: BigFiveProfile = {
      openness: calcAvg(traits.openness),
      conscientiousness: calcAvg(traits.conscientiousness),
      extraversion: calcAvg(traits.extraversion),
      agreeableness: calcAvg(traits.agreeableness),
      stability: calcAvg(traits.stability)
    };

    // Calculate Sincerity Score (Based on "Control" questions)
    // Control questions are "Traps". 
    // E.g., "I never lie". If user answers 5 (Agree Strongly), they are lying/exaggerating.
    // So for Control questions, a High Score = LOW Sincerity.
    // We invert the control scores to get "Sincerity".
    const rawControlScore = calcAvg(traits.control); 
    const sincerityScore = 100 - rawControlScore; 

    return { bigFiveScores, sincerityScore };
  };

  const goToStep3 = () => {
    if (answers.some(a => a === 0)) {
      alert("Por favor, responda todas as perguntas antes de finalizar.");
      return;
    }
    const challenge = getRandomChallenge(formData.role || 'SDR');
    setActiveChallenge(challenge);
    setStep(3);
  };

  // --- AUDIO & TIMER LOGIC ---
  const startChallenge = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setIsChallengeStarted(true);
        audioChunksRef.current = []; // Reset chunks

        // Initialize Recorder
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        // Start Recording
        mediaRecorderRef.current.start();
        setIsRecording(true);

        // Start Timer
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              stopRecording();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Precisamos do seu microfone para o desafio. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  const finishAll = () => {
    const { bigFiveScores, sincerityScore } = calculateResults();
    
    // Inject Sincerity Score into the passed data
    // We pass it inside the "scores" object temporarily or handle it in the parent
    // The parent expects (formData, bigFiveScores, challengeData). 
    // We will attach sincerity to the final object in the App.tsx handler by modifying the interface there implicitly or handling the extra data.
    // For now, let's attach it to the `challengeData` as a hack or update the parent signature. 
    // Ideally, update the signature.
    
    const challengeData = {
        challengeText: activeChallenge,
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : '',
        durationSeconds: 60 - timeLeft,
        sincerityScore // Passing it here
    };
    
    onCandidateSubmit(formData, bigFiveScores, challengeData);
    setStep(4);
  };

  // --- RENDERERS ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-brand-dark">Vamos construir seu Perfil</h2>
        <p className="text-slate-500">Primeiro, conte-nos sobre sua trajetória e ambições.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nome Completo</label>
              <div className="relative">
                 <User className="absolute left-3 top-3 text-slate-400" size={18} />
                 <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none font-semibold text-slate-800"
                    placeholder="Seu nome"
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">WhatsApp</label>
              <div className="relative">
                 <div className="absolute left-3 top-3 text-green-500 font-bold text-xs bg-green-100 px-1 rounded">WA</div>
                 <input 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-slate-800"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Área de Atuação</label>
              <div className="relative">
                 <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                 <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-slate-800 appearance-none"
                 >
                    <option value="">Selecione...</option>
                    <option value="SDR">SDR (Pré-vendas)</option>
                    <option value="BDR">BDR (Outbound)</option>
                    <option value="Closer">Closer / Executivo de Contas</option>
                    <option value="CS">Customer Success</option>
                    <option value="Sales Ops">Sales Ops</option>
                    <option value="Manager">Gestão de Vendas</option>
                 </select>
              </div>
           </div>
           
           {/* LOCATION SELECTORS */}
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Localização</label>
              <div className="grid grid-cols-3 gap-2">
                 <select 
                    name="locationState"
                    value={formData.locationState}
                    onChange={handleInputChange}
                    className="col-span-1 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                 >
                    <option value="">UF</option>
                    {statesList.map(s => <option key={s.id} value={s.sigla}>{s.sigla}</option>)}
                 </select>
                 <select 
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleInputChange}
                    disabled={!formData.locationState || isLoadingCities}
                    className="col-span-2 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm disabled:bg-slate-100"
                 >
                    <option value="">{isLoadingCities ? 'Carregando...' : 'Cidade'}</option>
                    {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">LinkedIn</label>
              <div className="relative">
                 <Linkedin className="absolute left-3 top-3 text-blue-600" size={18} />
                 <input 
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-slate-800"
                    placeholder="linkedin.com/in/voce"
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Remuneração Atual/Média (R$)</label>
              <div className="relative">
                 <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
                 <input 
                    type="number"
                    name="salaryExpectation"
                    value={formData.salaryExpectation}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-slate-800"
                    placeholder="Salário Fixo + Comissão"
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Currículo (PDF/DOC)</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors group cursor-pointer">
                 <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" />
                 <Upload className="mx-auto text-slate-400 group-hover:text-brand-primary mb-2 transition-colors" />
                 <p className="text-sm font-bold text-slate-600">{formData.fileName || "Arraste ou clique para enviar"}</p>
                 {formData.fileName && <p className="text-xs text-green-600 font-bold mt-1">Arquivo selecionado!</p>}
              </div>
           </div>
        </div>
      </div>

      <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Seu Pitch (Opcional)</label>
          <div className="relative">
              <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
              <textarea 
                name="pitch"
                value={formData.pitch}
                onChange={handleInputChange}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none resize-none text-sm"
                placeholder="Por que você é o match perfeito para o próximo desafio? Venda seu peixe em poucas linhas."
              />
          </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
           onClick={() => setStep(2)}
           disabled={!formData.fullName || !formData.role}
           className="px-8 py-4 bg-brand-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           Ir para Teste Comportamental <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const startIndex = currentQuestionBlock * 6;
    const blockQuestions = PSYCHOMETRIC_QUESTIONS.slice(startIndex, startIndex + 6);
    const progress = Math.round(((startIndex + 6) / 30) * 100);

    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-500">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-brand-dark flex items-center justify-center gap-2">
               <BrainCircuit className="text-brand-primary" /> Mapeamento Big Five
            </h2>
            <p className="text-slate-500 mt-2">
               Responda com honestidade. Perguntas de controle de sinceridade estão ativas.
            </p>
         </div>

         <div className="space-y-6">
            {blockQuestions.map((qConfig, idx) => {
               const absoluteIndex = startIndex + idx;
               return (
                  <div key={absoluteIndex} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-brand-primary/30 transition-colors">
                     <p className="font-bold text-slate-800 text-lg mb-4">
                        {absoluteIndex + 1}. {qConfig.text}
                     </p>
                     
                     <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">Discordo Totalmente</span>
                        <div className="flex gap-2 sm:gap-4">
                           {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                 key={val}
                                 onClick={() => handleLikertChange(absoluteIndex, val)}
                                 className={`
                                    w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 font-bold text-lg transition-all flex items-center justify-center
                                    ${answers[absoluteIndex] === val 
                                       ? 'bg-brand-primary border-brand-primary text-white scale-110 shadow-lg' 
                                       : 'bg-white border-slate-200 text-slate-400 hover:border-brand-primary hover:text-brand-primary'}
                                 `}
                              >
                                 {val}
                              </button>
                           ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">Concordo Totalmente</span>
                     </div>
                  </div>
               );
            })}
         </div>

         <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
             <button 
               onClick={() => {
                  if (currentQuestionBlock > 0) setCurrentQuestionBlock(prev => prev - 1);
                  else setStep(1);
               }}
               className="text-slate-400 hover:text-brand-dark font-bold text-sm flex items-center gap-1"
             >
                <ChevronLeft size={16} /> Voltar
             </button>

             <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Progresso: {progress}%
             </div>

             {currentQuestionBlock < 4 ? (
                <button 
                   onClick={() => {
                      const blockAnswers = answers.slice(startIndex, startIndex + 6);
                      if (blockAnswers.some(a => a === 0)) {
                         alert("Responda todas as perguntas desta página para avançar.");
                         return;
                      }
                      setCurrentQuestionBlock(prev => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2"
                >
                   Próxima Página <ChevronRight size={16} />
                </button>
             ) : (
                <button 
                   onClick={goToStep3}
                   className="px-8 py-3 bg-brand-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                   Próxima Etapa: Desafio <ArrowRight size={16} />
                </button>
             )}
         </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto text-center">
        
        {!isChallengeStarted ? (
            <div className="py-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse ring-4 ring-brand-primary/5">
                    <Mic size={48} className="text-brand-primary" />
                </div>
                <h2 className="text-3xl font-black text-brand-dark mb-4">Desafio Prático</h2>
                <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                    Você receberá uma <strong className="text-brand-primary">objeção comum de vendas</strong> para o cargo de {formData.role}.
                    Mostre seu jogo de cintura e instinto comercial.
                </p>
                
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-slate-600 text-sm font-medium mb-10 max-w-md shadow-sm flex items-start gap-3 text-left">
                    <AlertTriangle className="text-brand-primary shrink-0" size={20} />
                    <p>Ao clicar em começar, você terá <strong>60 segundos</strong> para ler a objeção e gravar sua resposta em áudio. Seja objetivo.</p>
                </div>

                <button 
                    onClick={startChallenge}
                    className="px-10 py-4 bg-brand-gradient text-white text-lg rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/30 flex items-center gap-3"
                >
                    <Mic size={24} /> Começar Gravação
                </button>
            </div>
        ) : (
            <div className="py-6 w-full">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desafio Surpresa</span>
                    <div className="flex items-center gap-2">
                        {isRecording && <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-secondary"></span>
                        </span>}
                        <span className="text-xs font-bold text-brand-secondary uppercase">{isRecording ? 'Gravando' : 'Finalizado'}</span>
                    </div>
                 </div>
                 
                 {/* Card da Objeção */}
                 <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-xl mb-10 relative overflow-hidden text-left">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-gradient"></div>
                    <p className="text-sm font-bold text-slate-400 mb-2">Cliente diz:</p>
                    <p className="text-2xl font-bold text-brand-dark leading-tight">
                        "{activeChallenge}"
                    </p>
                 </div>

                 <div className="flex flex-col items-center justify-center gap-8">
                    
                    {/* CRONÔMETRO */}
                    <div className="relative flex items-center justify-center">
                        {/* Círculo Animado */}
                        {isRecording && (
                            <div className="absolute w-40 h-40 rounded-full border-4 border-brand-primary/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        )}
                        <div className={`text-6xl font-black font-mono tracking-tighter transition-colors duration-300 ${
                            timeLeft <= 10 
                                ? 'text-red-500 animate-[pulse_0.5s_infinite]' 
                                : 'text-brand-primary'
                        }`}>
                            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </div>
                    </div>
                    
                    {isRecording ? (
                        <div className="flex flex-col items-center w-full max-w-xs">
                             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-brand-gradient'}`}
                                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                                ></div>
                             </div>

                             <button 
                                onClick={stopRecording}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                             >
                                <Square size={18} fill="currentColor" /> Finalizar Resposta
                             </button>
                        </div>
                    ) : audioBlob ? (
                         <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-lg animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-800">Áudio Capturado</h4>
                                    <p className="text-xs text-slate-500">Pronto para envio</p>
                                </div>
                                <div className="ml-auto">
                                    <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 w-24" />
                                </div>
                            </div>
                            
                            <button 
                                onClick={finishAll}
                                className="w-full py-4 bg-brand-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                Enviar Cadastro Completo <Send size={20} />
                            </button>
                            
                            <button 
                                onClick={() => { setAudioBlob(null); setIsRecording(false); setTimeLeft(60); startChallenge(); }}
                                className="mt-4 text-xs font-bold text-slate-400 hover:text-brand-primary flex items-center justify-center gap-1 mx-auto"
                            >
                                <RefreshCw size={12} /> Gravar Novamente
                            </button>
                         </div>
                    ) : (
                        <p className="text-sm text-slate-400">Processando...</p>
                    )}
                 </div>
            </div>
        )}
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 animate-in zoom-in-95 duration-500 max-w-lg mx-auto">
       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
       </div>
       <h2 className="text-3xl font-black text-brand-dark mb-4">Cadastro Recebido!</h2>
       <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Obrigado por completar seu perfil e o desafio prático. Nossa inteligência artificial já está analisando suas respostas e seu áudio para encontrar o match perfeito.
       </p>
       <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl mb-8">
         Entraremos em contato via WhatsApp caso surja uma oportunidade compatível com seu arquétipo.
       </p>
       
       {onExitPublicMode && (
         <button 
            onClick={onExitPublicMode}
            className="text-slate-400 hover:text-brand-primary text-xs font-bold uppercase tracking-widest"
         >
            ← Voltar ao Modo Admin (Simulação)
         </button>
       )}
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50/50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
         
         {/* Top Progress Strip */}
         {step < 4 && (
            <div className="h-2 bg-slate-100 w-full">
               <div 
                  className="h-full bg-brand-gradient transition-all duration-700 ease-out" 
                  style={{ width: step === 1 ? '30%' : step === 2 ? `${30 + ((currentQuestionBlock + 1) / 5) * 40}%` : '90%' }}
               ></div>
            </div>
         )}

         <div className="p-8 md:p-12">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderSuccess()}
         </div>
      </div>
    </div>
  );
};
