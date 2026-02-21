
import { Role } from '../types';

export const ROLE_CHALLENGES: Record<Role | string, string[]> = {
  'SDR': [
    "O prospect atende e diz: 'Não tenho interesse, já uso um concorrente e estou feliz'. Como você desperta a curiosidade dele em 30 segundos?",
    "Você conseguiu falar com o decisor, mas ele diz: 'Me manda um e-mail que eu dou uma olhada'. Como você tenta garantir um próximo passo real?",
    "A secretária diz que o diretor não atende ligações comerciais. Qual a sua abordagem para conseguir passar por ela ou obter o contato direto?"
  ],
  'BDR': [
    "Você está prospectando uma empresa grande e o contato diz: 'Não temos orçamento aprovado para novas ferramentas este ano'. O que você responde?",
    "O cliente diz que só pode falar daqui a 6 meses. Como você tenta criar um senso de urgência para falar agora?",
    "O lead pergunta o preço logo no início da ligação fria. Como você contorna para vender valor antes de falar de preço?"
  ],
  'Closer': [
    "Na hora de fechar, o cliente diz: 'Seu produto é ótimo, mas está 20% mais caro que o concorrente'. O que você faz?",
    "O cliente diz: 'Preciso pensar e conversar com meu sócio'. Como você tenta resolver essa objeção na hora?",
    "O cliente quer fechar, mas pede um desconto que você não pode dar. Como você negocia mantendo o valor?"
  ],
  'Account Executive': [
    "Seu principal contato na empresa saiu. O novo gestor quer rever todos os contratos. Como você garante que eles fiquem com você?",
    "O cliente diz que vai cancelar porque não está vendo valor na ferramenta. Como você reverte essa situação?",
    "O cliente pede uma funcionalidade que o produto não tem para fechar o contrato. Como você contorna?"
  ],
  'CS': [
    "O cliente liga chateado dizendo que o suporte demorou para responder. Como você acalma a situação e resolve o problema?",
    "O cliente diz que vai cancelar porque 'não está usando muito'. Como você mostra o valor que ele está perdendo?",
    "Você precisa oferecer um plano mais caro (Upsell), mas o cliente está relutante em gastar mais. Qual sua abordagem?"
  ],
  'Sales Manager': [
    "Um vendedor do seu time não bateu a meta por 2 meses seguidos. Como você inicia a conversa de feedback com ele?",
    "A meta do mês aumentou, mas o time está desmotivado. O que você diz na reunião de segunda-feira?",
    "Dois vendedores estão disputando a comissão do mesmo cliente. Como você resolve o conflito de forma justa?"
  ],
  // Fallbacks genéricos e acessíveis
  'Farmer': [
    "O cliente diz que está satisfeito com o pacote básico. Como você planta a semente para ele querer o pacote premium?",
    "O cliente ameaça ir para o concorrente por causa de preço. Como você defende seu produto?",
    "O contrato está vencendo e o cliente não responde seus e-mails de renovação. O que você faz?"
  ],
  'Sales Ops': [
    "Os vendedores não estão preenchendo o CRM corretamente. Como você os convence da importância disso sem ser o 'chato'?",
    "Você precisa implementar uma mudança no processo que vai dar mais trabalho para o time no início. Como você 'vende' essa ideia?",
    "A diretoria pede um relatório urgente, mas os dados estão incompletos. Como você gerencia essa expectativa?"
  ],
  'RevOps': [
    "Marketing diz que mandou leads bons, Vendas diz que os leads são ruins. Como você investiga quem tem razão?",
    "Precisamos cortar custos de ferramentas. Como você decide o que é essencial e o que pode ser cortado?",
    "Como você explica para um vendedor que a comissão dele foi calculada errada (para menos) e será corrigida?"
  ],
  'Head Comercial': [
    "A operação não vai bater a meta este mês. Como você comunica isso para o CEO e qual o plano de ação?",
    "Você precisa demitir uma pessoa que é muito querida pelo time, mas não entrega resultados. Como conduz?",
    "O time está reclamando que o produto está difícil de vender. Como você motiva a equipe a vender o que tem hoje?"
  ],
  'COO': [
    "As vendas caíram 30% no último trimestre. Quais são as 3 primeiras coisas que você analisa?",
    "Existe uma briga cultural entre o time de Vendas (agressivo) e o time de Produto (técnico). Como você une os dois?",
    "Precisamos aumentar a margem de lucro. Você prefere aumentar preço ou cortar custos? Por quê?"
  ]
};

export const getRandomChallenge = (role: string): string => {
  const challenges = ROLE_CHALLENGES[role] || ROLE_CHALLENGES['SDR']; // Fallback to SDR
  const randomIndex = Math.floor(Math.random() * challenges.length);
  return challenges[randomIndex];
};
