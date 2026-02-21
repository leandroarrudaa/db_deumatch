
import { BigFiveProfile, PsychometricSubTraits, Job, Candidate } from '../types';

// --- HELPER: Randomize within range ---
const randomize = (base: number, variance = 8) => {
    const val = base + (Math.random() * variance * 2 - variance);
    return Math.round(Math.min(100, Math.max(0, val)));
};

// --- 1. SUB-TRAIT CALCULATOR (The 20 Facets Engine) ---
const calculateSubTraits = (scores: BigFiveProfile): PsychometricSubTraits => {
    const { openness, conscientiousness, extraversion, agreeableness, stability } = scores;

    return {
        // 1. Sensibilidade Emocional (Stability Inverted logic mostly)
        autoconfianca: randomize(stability + 5), 
        temperamento: randomize(stability), 
        impulsividade: randomize(100 - conscientiousness), 
        vulnerabilidade: randomize(100 - stability), 

        // 2. Amabilidade
        julgamento: randomize(agreeableness), 
        sensibilidade: randomize(agreeableness + 10), 
        confronto: randomize(100 - agreeableness), 
        competicao: randomize(100 - agreeableness + (extraversion/5)), 

        // 3. Extroversão
        desinibicao: randomize(extraversion + 5),
        sociabilidade: randomize(extraversion),
        influencia: randomize(extraversion + (conscientiousness > 60 ? 5 : -5)),
        energia: randomize(extraversion),

        // 4. Disciplina
        ambicao: randomize(conscientiousness + (extraversion > 50 ? 5 : 0)),
        autodisciplina: randomize(conscientiousness),
        planejado: randomize(conscientiousness + 5),
        perfeccionismo: randomize(conscientiousness),

        // 5. Abertura
        imaginacao: randomize(openness),
        abertura: randomize(openness + 5), 
        regulacao: randomize(openness), 
        praticidade: randomize(100 - openness) 
    };
};

// --- DEEP NARRATIVE GENERATORS (ALFREDO SOARES STYLE) ---

const getDnaNarrative = (bigFive: BigFiveProfile, sub: PsychometricSubTraits) => {
    const ext = bigFive.extraversion;
    const cons = bigFive.conscientiousness;
    const stab = bigFive.stability;

    let narrative = "";

    // PARAGRAPH 1: OPERATING SYSTEM (Mindset & Motivation)
    if (ext > 70 && cons > 70) {
        narrative += "Estamos analisando um 'Trator de Alta Precisão'. A arquitetura mental deste indivíduo é projetada para conquista de território com eficiência cirúrgica. Ao contrário do vendedor puramente relacional que depende do carisma, ou do técnico que se esconde atrás de planilhas, este perfil combina uma agressividade comercial natural com um sistema de execução blindado. Ele acorda motivado não apenas pelo dinheiro, mas pela 'vitória sobre o caos'. Sua mente funciona em blocos de execução: ele não vê tarefas, vê degraus para o topo. Em ambientes de alta pressão, enquanto outros paralisam, ele organiza a fila de ataque e executa sem piedade.";
    } else if (ext > 75 && cons < 50) {
        narrative += "Este é o arquétipo do 'Caçador Intuitivo'. Sua mente opera em uma frequência de alta voltagem social e improviso genial. Ele não lê o manual; ele reescreve as regras conforme o jogo acontece. Sua motivação é a adrenalina da caça e o aplauso do palco. Sob pressão, ele brilha através da criatividade e da capacidade de persuadir qualquer pessoa a entrar no seu barco. No entanto, sua aversão a rotinas lineares significa que ele funciona em picos de genialidade intercalados com vales de desorganização. Ele não é movido por processos, é movido por desafios impossíveis que massageiam seu ego e validam sua capacidade de fazer mágica onde outros veem muros.";
    } else {
        narrative += "Identificamos um perfil de 'Consistência Tática e Diplomacia'. A estrutura psicológica aqui privilegia a sustentabilidade das relações e a previsibilidade dos resultados sobre picos erráticos de performance. Ele não é o lobo solitário que uiva para a lua, mas o arquiteto que constrói a fortaleza tijolo por tijolo. Sua motivação reside na segurança, no domínio técnico e no reconhecimento da sua competência especializada. Sob pressão, ele tende a se retrair para analisar os dados antes de agir, evitando riscos desnecessários. É o motor diesel da operação: demora um pouco mais para arrancar, mas, uma vez em movimento, é imparável e raramente quebra.";
    }

    narrative += "\n\n";

    // PARAGRAPH 2: EMOTIONAL ENGINE (Reaction to Failure)
    if (stab > 70) {
        narrative += "Sua blindagem emocional é um ativo estratégico de valor inestimável. Diante da rejeição massiva — o cenário padrão em vendas de alta performance — este candidato processa o 'não' como um dado estatístico, não como uma ofensa pessoal. Isso permite que ele mantenha a cadência de prospecção (Cold Calls/Meetings) constante, sem os vales de produtividade causados por frustração que derrubam 80% dos vendedores. Ele possui um distanciamento estoico que transmite autoridade imediata ao cliente; ele não 'precisa' da venda, ele 'oferece' uma oportunidade, e essa inversão de frame é poderosa.";
    } else {
        narrative += "O sistema emocional apresenta pontos de alta sensibilidade que exigem gestão atenta. Existe uma permeabilidade maior ao ambiente externo; o humor do escritório ou a dureza de um prospect afetam diretamente sua energia vital. Embora essa sensibilidade o torne extremamente empático e capaz de ler as entrelinhas em negociações complexas (sentindo o que o cliente não diz), ela cobra um preço alto em recuperação mental. Após uma sequência de derrotas, ele precisará de validação externa e tempo para recalibrar. A gestão não pode ser apenas de cobrança, deve atuar como um escudo psicológico.";
    }

    narrative += "\n\n";

    // PARAGRAPH 3: SOCIAL DYNAMICS (Influence Style)
    if (bigFive.agreeableness < 40) {
        narrative += "No campo de batalha social, ele adota uma postura de 'Dominância Pragmática'. Não está aqui para fazer amigos, está aqui para fechar negócios. Sua comunicação é direta, cortante e focada no resultado final. Isso é excelente para negociações com C-Levels e Compras, onde a objetividade é respeitada. Contudo, essa baixa amabilidade pode ser interpretada como arrogância por peers ou clientes mais relacionais. Ele lidera pela competência e pela força de vontade, atropelando obstáculos (e às vezes pessoas) para garantir que a meta seja batida.";
    } else {
        narrative += "Sua abordagem social é caracterizada pela 'Engenharia de Conexões'. Ele entende que vendas B2B são, antes de tudo, vendas H2H (Human to Human). Ele constrói pontes onde outros levantam muros, utilizando uma escuta ativa genuína para desarmar as defesas do cliente. Ele não vence pela imposição, mas pelo cerco diplomático, tornando-se um conselheiro confiável (Trusted Advisor) para o cliente. Internamente, é o pilar que mantém a coesão do time, mas deve cuidar para não sacrificar a margem da empresa em nome da harmonia da relação.";
    }

    return narrative;
};

const getCareerAnalysisFull = (candidate: Candidate) => {
    let analysis = "";

    // PARAGRAPH 1: TRAJECTORY & STABILITY
    analysis += `Análise de Trajetória e Estabilidade: Ao dissecar a cronologia profissional de ${candidate.name}, observamos um padrão que fala muito sobre sua maturidade comercial. `;
    if (candidate.seniority === 'Sênior') {
        analysis += "O currículo demonstra 'Resiliência de Ciclo Longo'. O candidato não apenas ocupou cadeiras, mas sobreviveu a ciclos completos de vendas (do plantio à colheita e renovação). A permanência consistente em posições anteriores sugere uma capacidade de navegar pela política corporativa e entregar resultados sustentáveis, fugindo do padrão 'mercenário' de curto prazo que troca de crachá por pequenos incrementos salariais. Este é um perfil que se paga no longo prazo, trazendo consigo um playbook validado de erros e acertos que acelerará a curva de aprendizado da sua operação.";
    } else {
        analysis += "A trajetória ainda é fragmentada, típica de um perfil em fase de exploração e descoberta de nicho (Job Hopping Tático). O candidato busca posições onde há espaço para aprendizado acelerado e mentoria. O risco aqui não é competência técnica, é retenção estratégica: se a sua empresa não oferecer um plano de carreira claro e feedbacks constantes nos primeiros 12 meses, a tendência é que ele use esta vaga apenas como mais um trampolim de validação. O foco da contratação deve ser na sua 'treinabilidade' (coachability) e na fome de crescimento, não no histórico passado.";
    }

    analysis += "\n\n";

    // PARAGRAPH 2: NICHE & ADAPTABILITY
    analysis += "Contexto de Nicho e Adaptação Cultural: ";
    analysis += "Analisando o background técnico versus a realidade do mercado atual, percebe-se um profissional que foi forjado no fogo da operação. ";
    if (candidate.role.includes('Hunter') || candidate.role.includes('SDR')) {
        analysis += "Sua experiência aponta para vendas de volume e velocidade. Ele está condicionado a ambientes de 'High Velocity Sales', onde a resposta rápida e a resiliência à rejeição são a moeda de troca. Colocá-lo em uma venda enterprise de ciclo de 18 meses pode ser um erro fatal de alocação, pois a falta de dopamina diária (fechamentos rápidos) irá drenar sua motivação. Ele performa onde a atividade é frenética e o placar muda todo dia.";
    } else {
        analysis += "Seu histórico sugere uma especialização em vendas consultivas e complexas. Ele está acostumado a mapear hierarquias, influenciar múltiplos stakeholders e gerenciar ciclos de venda longos. Este perfil sofrerá em ambientes transacionais de 'One Call Close'. Sua inteligência brilha na construção de valor e no diagnóstico profundo, não na insistência telefônica massiva. Ele não é um soldado de infantaria para a trincheira; ele é um estrategista para a sala de guerra.";
    }

    analysis += "\n\n";

    // PARAGRAPH 3: CRITICAL VERDICT
    analysis += "Veredito Crítico: ";
    analysis += "Este não é um currículo de manutenção, é um currículo de construção. Os dados indicam que o candidato está em um momento de inflexão na carreira, buscando consolidar sua autoridade. O risco de contratação é moderado, mitigado apenas se a gestão estiver disposta a dar autonomia com responsabilidade. Não o contrate para seguir um script cego; contrate-o para ajudar a reescrever o script. O ROI deste profissional virá da sua capacidade de trazer insights de fora para dentro da operação.";

    return analysis;
};

// --- SYNTHESIS PAGE 4 (THE INTELLIGENCE BRIDGE) ---

const getSynthesisText = (candidate: Candidate, sub: PsychometricSubTraits) => {
    let text = "";

    // BLOCK 1: THE CORE COMBINATION (What does the mix mean?)
    text += "ANÁLISE HOLÍSTICA DA COMBINAÇÃO DE TRAÇOS\n";
    if (sub.ambicao > 80 && sub.confronto > 70) {
        text += "Estamos diante de uma configuração psicométrica de 'Predador Apex'. A fusão de altíssima Ambição (o desejo insaciável de conquista) com alto Confronto (a ausência de medo do conflito) cria uma máquina de guerra comercial. Este perfil não pede licença; ele toma espaço. No ecossistema de vendas, isso significa um fechador que não deixa dinheiro na mesa e que pressiona o cliente até o limite ético para garantir a conversão. Contudo, essa força motriz pode ser destrutiva internamente. Ele tende a ver colegas não como aliados, mas como competidores pelos mesmos recursos (leads). A gestão precisa canalizar essa agressividade estritamente para fora da empresa, caso contrário, ele implodirá a cultura do time.";
    } else if (sub.sensibilidade > 80 && sub.autodisciplina > 80) {
        text += "A assinatura psicométrica revela um 'Guardião de Alta Performance'. A rara combinação de Sensibilidade elevada (empatia e leitura de ambiente) com Autodisciplina rígida cria o perfil perfeito para gestão de carteira e Customer Success de alto valor (High-Touch). Ele tem a disciplina para executar os rituais de atendimento (QBRs, Check-ins) com precisão militar, enquanto usa sua inteligência emocional para criar laços indestrutíveis com o cliente. Ele não venderá pela pressão, mas pela constância e confiança absoluta. O risco é o 'Burnout Silencioso': ele absorverá os problemas do cliente e se cobrará excessivamente para resolvê-los, muitas vezes sem pedir ajuda.";
    } else {
        text += "O gráfico revela um perfil de 'Equilíbrio Adaptativo'. Não vemos aqui os extremos perigosos dos 'Lobos Solitários' nem a passividade dos puramente técnicos. Há uma harmonia funcional entre a capacidade de se relacionar (Extroversão moderada) e a capacidade de entregar (Conscienciosidade estável). Este é o jogador 'Box-to-Box': consegue atuar na prospecção inicial com competência e transitar para o fechamento e gestão sem perder a qualidade. Ele é a cola que une o departamento comercial. Pode não ser o Top Performer #1 que quebrará todos os recordes em um mês isolado, mas será o profissional mais consistente do ano, entregando a meta mês a mês sem gerar passivo trabalhista ou emocional.";
    }

    text += "\n\n";

    // BLOCK 2: SUPERPOWERS (Where are they World Class?)
    text += "ZONA DE DOMÍNIO ABSOLUTO (Onde ele é 'World Class')\n";
    if (sub.influencia > 80) {
        text += "Este candidato é letal em negociações onde o fechamento depende de resistência psicológica e domínio de frame. Sua capacidade de Influência e Desinibição permite que ele controle a temperatura da sala, invertendo situações onde o cliente parece ter o poder. Em cenários de crise ou em reuniões de board onde é necessário 'vender o sonho' sem ter o produto pronto, ele brilhará. Ele vende a visão, a confiança e a certeza, elementos intangíveis que scripts não conseguem capturar.";
    } else {
        text += "Sua maestria reside na venda técnica e consultiva baseada em diagnóstico. Onde concorrentes tentam ganhar no grito ou no desconto, este perfil ganha na profundidade. Ele tem a paciência cognitiva para entender as dores complexas do cliente e desenhar soluções que parecem customizadas. Em vendas Enterprise de ciclo longo, onde a decisão passa por múltiplos comitês técnicos e financeiros, a sua abordagem detalhista e organizada (High Conscientiousness) é a única que sobrevive ao escrutínio de compliance e engenharia.";
    }

    text += "\n\n";

    // BLOCK 3: THE LATENT RISKS (The dark side)
    text += "MAPA DE RISCOS LATENTES E PONTOS CEGOS\n";
    if (sub.impulsividade > 60 || sub.planejado < 40) {
        text += "Atenção vermelha para a gestão de processos e dados. O perfil indica uma 'Aversão à Burocracia' que pode custar caro. Ele tende a confiar excessivamente no talento e no improviso, negligenciando o registro de informações vitais no CRM. O risco real é a perda de inteligência comercial: ele fecha a venda, mas a empresa não sabe como nem porquê. Além disso, sua impulsividade pode levá-lo a prometer features que o produto não tem (Overpromising) para fechar o deal agora, gerando um passivo de churn e insatisfação para o time de CS e Produto no futuro.";
    } else {
        text += "O perigo silencioso aqui é a 'Paralisia por Análise' e a aversão ao risco social. Em momentos de mercado onde é necessário volume bruto e 'cara de pau' para abrir portas na força bruta (Cold Call agressiva), este perfil travará. Ele buscará a preparação perfeita, o script perfeito e o momento perfeito — coisas que não existem em vendas. Sua necessidade de segurança e perfeccionismo pode torná-lo lento demais para acompanhar o ritmo de uma startup em hyper-growth. Ele precisa ser empurrado para a ação, ou passará o dia planejando como vender, sem vender nada.";
    }

    return text;
};

// --- OPERATIONS MANUAL PAGE 5 ---

const getManagerManual = (candidate: Candidate, sub: PsychometricSubTraits) => {
    // POTENCY ZONES (10+ lines)
    let potency = "";
    potency += "CENÁRIOS DE ALTA ADERÊNCIA E PERFORMANCE MÁXIMA:\n";
    
    // Check main extraversion score instead of sub-trait which doesn't exist
    if (candidate.bigFive.extraversion > 60) {
        potency += "1. Abertura de Novos Mercados (Greenfield): Coloque este profissional na linha de frente para desbravar territórios onde a marca ainda é desconhecida. Sua energia social é combustível para superar a inércia inicial do mercado.\n";
        potency += "2. Recuperação de Clientes Críticos: Situações onde o relacionamento azedou exigem sua capacidade de influência e charme tático para reverter o quadro emocional do cliente.\n";
        potency += "3. Eventos e Feiras de Negócios: Ele deve ser o rosto da empresa no stand. Sua capacidade de atrair atenção e iniciar conversas do zero é um ativo para geração de leads qualificados em massa.\n";
        potency += "4. Vendas de 'Sonho' e Inovação: Produtos disruptivos que exigem evangelização funcionam bem aqui. Ele consegue vender o conceito antes mesmo da funcionalidade estar 100% pronta.\n";
    } else {
        potency += "1. Gestão de Contas Enterprise (Key Accounts): Cenários onde o erro custa milhões. Sua atenção aos detalhes e disciplina garantem que nenhum SLA seja violado e que o cliente se sinta seguro.\n";
        potency += "2. Vendas Técnicas/Engenharia: Quando o interlocutor do outro lado é um técnico cético, este perfil ganha a confiança pela competência e precisão, não pela lábia.\n";
        potency += "3. Estruturação de Processos de Vendas (Sales Ops): Use sua mente organizada para limpar o CRM, desenhar playbooks e otimizar o funil. Ele vê gargalos que os vendedores 'stars' ignoram.\n";
        potency += "4. Negociações de Contratos Complexos: Onde é necessário ler as letras miúdas e negociar termos jurídicos e financeiros com paciência e rigor.\n";
    }
    potency += "5. Mentoria Técnica: Ele tem a paciência e o método necessários para treinar juniores nos aspectos técnicos do produto e do processo de vendas.";

    // RISKS ZONES (Detailed)
    let risks = "";
    risks += "O QUE DRENA A ENERGIA E MATA A PERFORMANCE:\n";
    if (sub.autodisciplina < 50) {
        risks += "• Microgerenciamento e Burocracia Excessiva: Ele odeia preencher relatórios de 'atividade por atividade'. Se sentir que o foco é mais no processo do que no resultado, ele vai desengajar e sabotar o sistema.\n";
        risks += "• Rotina Monótona e Repetitiva: Tarefas administrativas repetitivas (data entry) são kriptonita para este perfil. Ele precisa de novidade, movimento e desafios variados para manter o nível de dopamina alto.\n";
        risks += "• Isolamento Físico ou Social: Deixá-lo trabalhando sozinho em home office sem interação constante pode levá-lo à desmotivação depressiva. Ele recarrega as baterias na troca com outros seres humanos.";
    } else {
        risks += "• Caos e Mudança Constante de Regras: Ambientes onde a meta muda toda semana e o playbook é reescrito diariamente vão gerar ansiedade paralisante. Ele precisa de clareza, estrutura e previsibilidade para operar.\n";
        risks += "• Pressão por Improviso Público: Colocá-lo em uma reunião sem pauta ou pedir para ele 'falar um pouco' sem preparação prévia é um ato de violência psicológica contra este perfil. Ele odeia parecer despreparado.\n";
        risks += "• Conflito Emocional Aberto: Ambientes tóxicos de gritaria ou competição desleal farão com que ele se feche em sua concha e busque outro emprego silenciosamente.";
    }

    // MANAGEMENT GUIDE (Prescriptive)
    let management = "";
    management += "PROTOCOLO DE LIDERANÇA E COMANDO:\n";
    management += "• COMO COBRAR: ";
    if (sub.sensibilidade > 60) {
        management += "Nunca faça correções duras em público. Use a técnica do Feedback Sanduíche, mas seja específico. Foque no comportamento, não na identidade. Ele precisa sentir que a correção é para o crescimento dele, não uma punição. Valide o esforço antes de criticar o resultado.\n";
    } else {
        management += "Seja brutalmente direto e baseie-se em números. Não 'dore a pílula'. Mostre o dashboard, aponte o gap e pergunte: 'Qual o plano para resolver isso até sexta?'. Ele respeita a autoridade que vem da lógica e dos dados, despreza discursos motivacionais vazios.\n";
    }
    management += "• COMO INCENTIVAR: ";
    if (sub.ambicao > 80) {
        management += "Dinheiro, Status e Competição. Crie rankings públicos. Dê bônus agressivos por superação de meta. Mostre o caminho para ele se tornar Sócio ou Diretor. O desafio deve parecer impossível para os outros, mas viável para ele.";
    } else {
        management += "Segurança, Autonomia e Propósito. Dê a ele a chave de projetos importantes. Reconheça publicamente sua maestria técnica. Ofereça cursos e certificações. Mostre como o trabalho dele impacta positivamente a vida dos clientes.";
    }

    return { potency, risks, management };
};


export interface PdfReportData {
    identity: {
        archetype: string;
        narrative: string;
        careerAnalysis: string;
    };
    deepDive: {
        emotional: string; // Not strictly used in new layout but kept for compatibility
        agreeableness: string;
        extraversion: string;
        discipline: string;
        openness: string;
    };
    facets: PsychometricSubTraits;
    managerManual: {
        potency: string;
        risks: string;
        management: string;
    };
    synthesis: {
        text: string;
    };
}

export const generatePdfReportData = (candidate: Candidate): PdfReportData => {
    const { bigFive } = candidate;
    const subTraits = calculateSubTraits(bigFive);

    let archetype = 'GENERALISTA TÁTICO';
    if (bigFive.conscientiousness > 85 && bigFive.extraversion > 70) archetype = 'HUNTER DE ELITE';
    else if (bigFive.stability > 85 && bigFive.conscientiousness > 75) archetype = 'CLOSER IMPLACÁVEL';
    else if (bigFive.agreeableness > 85 && bigFive.extraversion > 60) archetype = 'DIPLOMATA ESTRATÉGICO';
    else if (bigFive.openness > 85) archetype = 'ARQUITETO DE SOLUÇÕES';

    // Page 2 Texts (Deep Narrative)
    const dnaNarrative = getDnaNarrative(bigFive, subTraits);
    const careerAnalysis = getCareerAnalysisFull(candidate);

    // Page 4 Text (Synthesis)
    const synthesisText = getSynthesisText(candidate, subTraits);

    // Page 5 Texts (Manual)
    const manager = getManagerManual(candidate, subTraits);

    return {
        identity: { archetype, narrative: dnaNarrative, careerAnalysis },
        deepDive: { 
            emotional: "", agreeableness: "", extraversion: "", discipline: "", openness: "" 
        }, // Kept empty as Page 3 is now Visual X-Ray
        facets: subTraits,
        managerManual: manager,
        synthesis: { text: synthesisText }
    };
};

// ... keep existing exports for compatibility if needed ...
export const generateAIAnalysis = (scores: BigFiveProfile, name: string) => {
    const subTraits = calculateSubTraits(scores);
    return {
        archetype: 'Generalista',
        personalitySummary: 'Análise detalhada disponível no PDF.',
        likelyBehavior: 'Ver relatório completo.',
        areaOfPotency: 'Ver relatório completo.',
        subTraits,
        topSubTraits: ['Análise', 'Foco'],
        communicationScore: 8
    };
};
export const generateTacticalMandate = (job: Job) => "Mandato Tático Gerado.";
export const generateManagementGuide = (c: Candidate) => ({ energizers:[], drainers:[], managementAdvice:"" });
