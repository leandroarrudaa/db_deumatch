
import { Candidate, Job, MatchResult, Role, BigFiveProfile } from '../types';

// --- CONFIGURAÇÃO DE PERFIS IDEAIS E PESOS ---

interface PsychometricBenchmark {
  ideal: BigFiveProfile; // A pontuação "alvo" (0-100)
  weights: BigFiveProfile; // O peso de importância desse traço para a função (1-3)
}

const ROLE_BENCHMARKS: Record<string, PsychometricBenchmark> = {
  'SDR': {
    ideal: { openness: 60, conscientiousness: 90, extraversion: 70, agreeableness: 40, stability: 95 },
    weights: { openness: 1, conscientiousness: 2.5, extraversion: 1.5, agreeableness: 0.5, stability: 3 } // Estabilidade (Resiliência) é crucial
  },
  'BDR': {
    ideal: { openness: 65, conscientiousness: 85, extraversion: 75, agreeableness: 40, stability: 90 },
    weights: { openness: 1.5, conscientiousness: 2, extraversion: 2, agreeableness: 0.5, stability: 3 }
  },
  'Account Executive': { // Closer
    ideal: { openness: 70, conscientiousness: 80, extraversion: 90, agreeableness: 60, stability: 80 },
    weights: { openness: 1.5, conscientiousness: 2, extraversion: 3, agreeableness: 1.5, stability: 2 } // Extroversão (Influência) é crucial
  },
  'Closer': {
    ideal: { openness: 70, conscientiousness: 80, extraversion: 90, agreeableness: 50, stability: 85 },
    weights: { openness: 1, conscientiousness: 2, extraversion: 3, agreeableness: 1, stability: 2.5 }
  },
  'CS': {
    ideal: { openness: 60, conscientiousness: 75, extraversion: 65, agreeableness: 95, stability: 80 },
    weights: { openness: 1, conscientiousness: 2, extraversion: 1.5, agreeableness: 3, stability: 2 } // Amabilidade (Empatia) é crucial
  },
  'Farmer': {
    ideal: { openness: 60, conscientiousness: 80, extraversion: 70, agreeableness: 85, stability: 75 },
    weights: { openness: 1, conscientiousness: 2, extraversion: 2, agreeableness: 2.5, stability: 1.5 }
  },
  'Sales Manager': {
    ideal: { openness: 75, conscientiousness: 90, extraversion: 80, agreeableness: 70, stability: 85 },
    weights: { openness: 1.5, conscientiousness: 3, extraversion: 2, agreeableness: 2, stability: 2.5 }
  },
  // Default fallback
  'default': {
    ideal: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, stability: 50 },
    weights: { openness: 1, conscientiousness: 1, extraversion: 1, agreeableness: 1, stability: 1 }
  }
};

const calculatePsychometricScore = (candidateTraits: BigFiveProfile, role: string): { score: number, strongestTrait: string, weakestTrait: string } => {
  const benchmark = ROLE_BENCHMARKS[role] || ROLE_BENCHMARKS['default'];
  let totalWeightedScore = 0;
  let totalPossibleWeight = 0;
  
  let strongestDelta = -100;
  let strongestTrait = '';
  let weakestDelta = 100;
  let weakestTrait = '';

  (Object.keys(candidateTraits) as Array<keyof BigFiveProfile>).forEach(trait => {
    const candidateVal = candidateTraits[trait];
    const idealVal = benchmark.ideal[trait];
    const weight = benchmark.weights[trait];

    // Lógica de Penalidade por Distância:
    let distance = Math.abs(candidateVal - idealVal);
    
    // Bônus: Se o traço for crucial (Peso >= 2.5) e o candidato exceder o ideal, reduz a distância (recompensa).
    if (weight >= 2.5 && candidateVal > idealVal) {
        distance = 0; // Superou a expectativa no traço principal
    }

    const traitScore = Math.max(0, 100 - distance); // 0 a 100
    
    totalWeightedScore += traitScore * weight;
    totalPossibleWeight += 100 * weight;

    // Identificar pontos fortes e fracos relativos ao cargo
    const delta = (candidateVal - idealVal) * weight; // Ponderado
    if (delta > strongestDelta) {
        strongestDelta = delta;
        strongestTrait = trait;
    }
    if (distance > (100 - (100 * (weight/3))) && delta < weakestDelta) { // Lógica fuzzy para achar o gap
        weakestDelta = delta;
        weakestTrait = trait;
    }
  });

  const finalScore = (totalWeightedScore / totalPossibleWeight) * 100;
  return { score: finalScore, strongestTrait, weakestTrait };
};

export const calculateMatch = (candidate: Candidate, job: Job): MatchResult => {
  // 1. Technical Skills Match (40% weight) - Reduzido para dar lugar ao Fit Comportamental
  const technicalMatches = job.requiredSkills.filter(skill => 
    candidate.skills.some(cSkill => cSkill.toLowerCase() === skill.toLowerCase())
  );
  const technicalScore = (technicalMatches.length / job.requiredSkills.length) * 100;

  // 2. Fit Comportamental Ponderado por Função (40% weight)
  const psychoAnalysis = calculatePsychometricScore(candidate.bigFive, job.role);
  const behavioralScore = psychoAnalysis.score;

  // 3. Challenge Score (20% weight) - Teste Prático
  const challengeScore = candidate.challengeSubmission 
    ? candidate.challengeSubmission.communicationScore * 10 
    : 60; 

  // --- Weighted Total ---
  // Técnica: 35% | Comportamento: 45% | Desafio Prático: 20%
  let totalScore = (technicalScore * 0.35) + (behavioralScore * 0.45) + (challengeScore * 0.20);
  
  // Penalidade de Senioridade (Se a vaga pede Senior e é Junior)
  const seniorityLevels = { 'Júnior': 1, 'Pleno': 2, 'Sênior': 3 };
  const candidateLevel = seniorityLevels[candidate.seniority];
  const jobLevel = seniorityLevels[job.seniority];
  let seniorityGap = false;

  if (candidateLevel < jobLevel) {
      totalScore *= 0.85; // -15% se for menos sênior que a vaga
      seniorityGap = true;
  }

  // Ajuste Final
  totalScore = Math.max(0, Math.min(100, totalScore));

  const commonSkills = technicalMatches;
  const missingSkills = job.requiredSkills.filter(skill => 
    !candidate.skills.some(cSkill => cSkill.toLowerCase() === skill.toLowerCase())
  );

  // --- Justification Generator ---
  const traitPT: Record<string, string> = {
      openness: 'Abertura', conscientiousness: 'Disciplina', extraversion: 'Extroversão', agreeableness: 'Empatia', stability: 'Resiliência'
  };

  // --- AI ANALYSIS GENERATION ---
  
  let pros = "";
  let cons = "";

  // PROS Logic
  if (technicalScore > 80) {
      pros += `Domínio técnico robusto, possuindo quase todas as ferramentas solicitadas (${commonSkills.slice(0,2).join(', ')}...). `;
  } else if (technicalScore > 50) {
      pros += `Conhecimento técnico funcional nas ferramentas essenciais. `;
  }
  
  if (psychoAnalysis.score > 85) {
      pros += `Alinhamento comportamental excepcional para a função de ${job.role}, com destaque para alta ${traitPT[psychoAnalysis.strongestTrait]}. `;
  } else if (psychoAnalysis.score > 70) {
      pros += `Perfil equilibrado com bons índices de ${traitPT[psychoAnalysis.strongestTrait]}. `;
  }

  if (challengeScore > 80) pros += "Demonstrou excelente articulação no desafio prático.";

  // --- CONS Logic (Sales Ops Risk Analysis) ---
  const gaps: string[] = [];
  const { conscientiousness, extraversion, agreeableness, stability } = candidate.bigFive;

  // 1. Behavioral Risks (Big Five x Contexto)
  if (conscientiousness < 70) {
      gaps.push(`**Risco Operacional (CRM & Processos):** Baixa pontuação em disciplina (${conscientiousness}%). Na rotina de vendas, isso costuma gerar funis desatualizados e follow-ups esquecidos. **Alerta:** O gestor precisará fazer microgerenciamento diário de tarefas nas primeiras semanas.`);
  }

  if (extraversion < 60 && (job.role === 'SDR' || job.role === 'BDR' || job.role === 'Closer')) {
      gaps.push(`**Custo Energético na Prospecção:** Reserva social identificada (${extraversion}%). O candidato pode performar, mas o 'porta a porta' ou 'cold call' exigirá muito mais energia dele do que de um perfil natural. **Alerta:** Avaliar risco de burnout rápido em funções de alto volume.`);
  }

  if (agreeableness > 80 && (job.role === 'Closer' || job.role === 'Account Executive')) {
      gaps.push(`**Dificuldade em Negociação Dura:** Alta amabilidade (${agreeableness}%) indica tendência a evitar conflitos. Em fechamentos tensos, pode conceder descontos desnecessários para 'agradar' o lead. **Alerta:** Necessário roleplay intenso de defesa de preço e objeções duras.`);
  }

  if (stability < 60) {
      gaps.push(`**Sensibilidade à Rejeição:** Baixa estabilidade (${stability}%). A rotina de vendas envolve rejeição constante, o que pode abalar a performance deste perfil mais rapidamente. **Alerta:** Validar histórico de tolerância à frustração na entrevista.`);
  }

  // 2. Technical Gaps
  if (missingSkills.length > 0) {
      // Limit to 3 skills for brevity
      const skillNames = missingSkills.slice(0, 3).join(', ') + (missingSkills.length > 3 ? '...' : '');
      gaps.push(`**Curva de Aprendizado Técnica:** Ausência de vivência em: ${skillNames}. Isso impactará o ramp-up inicial. **Alerta:** Planejar treinamento técnico intensivo na primeira semana para mitigar atraso de produtividade.`);
  } else if (technicalScore < 50) {
      gaps.push(`**Gap de Ferramentas:** O candidato não possui experiência comprovada com o stack da empresa. **Alerta:** Validar agilidade de aprendizado na entrevista.`);
  }

  // 3. Seniority Risk
  if (seniorityGap) {
      gaps.push(`**Maturidade de Negócios:** Perfil ${candidate.seniority} para vaga ${job.seniority}. Pode faltar "casca grossa" para navegar em contas complexas ou falar de igual para igual com C-Level. **Alerta:** Avalie se a ambição (fome) compensa a falta de quilometragem.`);
  }

  // Fallback if no specific gaps found but score isn't 100
  if (gaps.length === 0 && totalScore < 95) {
      gaps.push(`**Atenção ao Fit Cultural:** O perfil é tecnicamente sólido, mas verifique se a expectativa salarial e de crescimento está alinhada com a realidade da vaga para evitar churn precoce por falta de desafio.`);
  }

  cons = gaps.join('\n\n');

  return {
    score: Math.round(totalScore),
    justification: pros, // Legacy fallback
    analysis: {
        pros,
        cons
    },
    details: {
      skillMatch: Math.round(technicalScore),
      cultureMatch: Math.round(behavioralScore),
      commonSkills,
      missingSkills
    }
  };
};
