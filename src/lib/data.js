import { subDays, subHours, subMinutes } from 'date-fns';

const now = new Date();

export const conversations = [
  {
    id: 'conv-1',
    title: 'Dr. Ricardo Oliveira',
    lastMessage: 'Ok, entendi. Pode me enviar o catálogo atualizado de próteses de quadril?',
    channel: 'Whatsapp',
    agent: 'IA-Bot',
    unreadCount: 2,
    timestamp: subMinutes(now, 5),
    status: 'unresolved',
    messages: [
      { id: 'msg-1-1', sender: 'user', text: 'Boa tarde, preciso de informações sobre as novas próteses de joelho da marca Zimmer.', timestamp: subHours(now, 2) },
      { id: 'msg-1-2', sender: 'agent', text: 'Olá, Dr. Ricardo! Claro, as próteses da Zimmer possuem revestimento em titânio e design anatômico aprimorado. Deseja os detalhes técnicos?', timestamp: subHours(now, 1) },
      { id: 'msg-1-3', sender: 'user', text: 'Ok, entendi. Pode me enviar o catálogo atualizado de próteses de quadril?', timestamp: subMinutes(now, 5) },
    ]
  },
  {
    id: 'conv-2',
    title: 'Ana Júlia - Hospital Central',
    lastMessage: 'Agradeço a ajuda, foi muito esclarecedor!',
    channel: 'Website Chat',
    agent: 'Mariana Costa',
    unreadCount: 0,
    timestamp: subHours(now, 3),
    status: 'resolved',
    messages: [
      { id: 'msg-2-1', sender: 'user', text: 'Tenho uma dúvida sobre o pedido #S45T89. Qual a previsão de entrega?', timestamp: subHours(now, 4) },
      { id: 'msg-2-2', sender: 'agent', text: 'Vou verificar o status do seu pedido. Só um momento.', timestamp: subHours(now, 3) },
      { id: 'msg-2-3', sender: 'human', text: 'Olá, Ana Júlia. Aqui é a Mariana. Seu pedido #S45T89 está com a transportadora e a previsão de entrega é para amanhã, até as 18h.', timestamp: subHours(now, 3) },
       { id: 'msg-2-4', sender: 'user', text: 'Agradeço a ajuda, foi muito esclarecedor!', timestamp: subHours(now, 3) }
    ]
  },
  {
    id: 'conv-3',
    title: 'Orçamento Urgente - Clínica Orto+',
    lastMessage: 'PRECISO FALAR COM UM HUMANO AGORA!! O BOT NÃO ENTENDE.',
    channel: 'Email',
    agent: 'IA-Bot',
    unreadCount: 1,
    timestamp: subHours(now, 1),
    status: 'human_requested',
    messages: [
       { id: 'msg-3-1', sender: 'user', text: 'Solicito cotação para 15 kits de fixação espinhal.', timestamp: subHours(now, 2) },
       { id: 'msg-3-2', sender: 'agent', text: 'Para qual CNPJ seria a cotação?', timestamp: subHours(now, 1) },
       { id: 'msg-3-3', sender: 'user', text: 'É para a Clínica Orto+, mas o sistema de vocês não está me reconhecendo.', timestamp: subHours(now, 1) },
       { id: 'msg-3-4', sender: 'user', text: 'PRECISO FALAR COM UM HUMANO AGORA!! O BOT NÃO ENTENDE.', timestamp: subHours(now, 1) }
    ]
  },
  {
    id: 'conv-4',
    title: 'Fernando Guimarães',
    lastMessage: 'Perfeito, comprarei novamente.',
    channel: 'Whatsapp',
    agent: 'Pedro Alves',
    unreadCount: 0,
    timestamp: subDays(now, 1),
    status: 'resolved',
    messages: []
  },
  {
    id: 'conv-5',
    title: 'Dra. Beatriz Lima',
    lastMessage: 'Ainda estou aguardando o retorno sobre a disponibilidade daquele material cirúrgico.',
    channel: 'Website Chat',
    agent: 'IA-Bot',
    unreadCount: 0,
    timestamp: subDays(now, 2),
    status: 'unresolved',
    messages: []
  },
  {
    id: 'conv-6',
    title: 'Suporte Técnico - Equipamentos',
    lastMessage: 'Meu equipamento de artroscopia não está ligando, preciso de suporte.',
    channel: 'Telefone',
    agent: 'IA-Bot',
    unreadCount: 5,
    timestamp: subMinutes(now, 30),
    status: 'unresolved',
    messages: []
  }
];

export const agents = [
  { id: 'ag-1', name: 'IA-Bot' },
  { id: 'ag-2', name: 'Mariana Costa' },
  { id: 'ag-3', name: 'Pedro Alves' }
];

export const channels = [
  { id: 'ch-1', name: 'Whatsapp' },
  { id: 'ch-2', name: 'Website Chat' },
  { id: 'ch-3', name: 'Email' },
  { id: 'ch-4', name: 'Telefone' }
];