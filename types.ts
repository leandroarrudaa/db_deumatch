
export type Role = 'SDR' | 'BDR' | 'Closer' | 'Account Executive' | 'CS' | 'Sales Manager' | 'Farmer' | 'Head Comercial' | 'COO' | 'Sales Ops' | 'RevOps';

export type Seniority = 'Júnior' | 'Pleno' | 'Sênior';

export type ApplicationStatus = 'top_talent' | 'interview' | 'simulation' | 'sent_to_company' | 'hired' | 'rejected';

export interface BigFiveProfile {
  openness: number;        // Abertura ao Novo
  conscientiousness: number; // Disciplina
  extraversion: number;    // Extroversão
  agreeableness: number;   // Amabilidade
  stability: number;       // Sensibilidade Emocional (Invertido na visualização positiva)
}

// Detailed sub-traits (Facets) - EXACT 20 VARIABLES SCHEMA
export interface PsychometricSubTraits {
  // 1. Sensibilidade Emocional
  autoconfianca: number;
  temperamento: number;
  impulsividade: number;
  vulnerabilidade: number;

  // 2. Amabilidade
  julgamento: number;   // Confiança nos outros
  sensibilidade: number; // Altruísmo
  confronto: number;    // Complacência vs Agressividade
  competicao: number;   // Modéstia vs Arrogância (Ajustado para vendas)

  // 3. Extroversão
  desinibicao: number;
  sociabilidade: number;
  influencia: number;   // Assertividade
  energia: number;      // Nível de atividade

  // 4. Disciplina (Conscienciosidade)
  ambicao: number;      // Busca por realização
  autodisciplina: number;
  planejado: number;    // Ordem/Organização
  perfeccionismo: number; // Senso de dever

  // 5. Abertura ao Novo
  imaginacao: number;   // Fantasia
  abertura: number;     // Estética/Ideias
  regulacao: number;    // Valores (Flexibilidade)
  praticidade: number;  // Ações (Inverso de rotina)
}

export interface Candidate {
  id: string;
  name: string;
  role: Role;
  seniority: Seniority;
  avatarUrl: string;
  bio: string;
  location: string;
  skills: string[]; 
  salaryExpectation: number;
  phone: string;
  resumeUrl?: string;
  
  // High-level Psychometrics
  bigFive: BigFiveProfile;
  subTraits: PsychometricSubTraits; // The 20 Facets
  
  // Qualitative Analysis
  archetype: string;
  personalitySummary: string;
  likelyBehavior: string;
  areaOfPotency: string;
  
  topSubTraits: string[];

  // Social Desirability
  sincerityScore: number;

  // Challenge Submission
  challengeSubmission?: {
    challengeText: string;
    audioUrl: string;
    durationSeconds: number;
    communicationScore: number;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  role: Role;
  seniority: Seniority;
  location: string;
  description: string;
  challenges: string[]; 
  salaryRange: [number, number];
  requiredSkills: string[];
  cultureFit: string[]; 
  active: boolean;
  postedAt: string;
  
  companyDescription: string;
  productSolution?: string;
  website: string;
  instagram: string;
  icp?: string;
  
  tacticalMandate?: string;
  idealProfile?: string;
  techStack?: string[];
  
  compensationDetails: string;
  deadline: string;
  dailyRoutine?: string[];
}

export interface Application {
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface MatchResult {
  score: number; 
  justification: string;
  analysis: {
    pros: string;
    cons: string;
  };
  details: {
    skillMatch: number;
    cultureMatch: number;
    commonSkills: string[];
    missingSkills: string[];
  };
}
