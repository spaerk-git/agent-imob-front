import { format, formatDistanceToNow, parseISO, toDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIMEZONE = 'America/Sao_Paulo';

const toSaoPauloTime = (date) => {
  const dateObj = toDate(date);
  const saoPauloDateStr = dateObj.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(saoPauloDateStr);
};

const formatSaoPauloDate = (date, formatStr) => {
  if (!date) return '';
  try {
    const dateObj = date instanceof Date ? date : parseISO(date.endsWith('Z') ? date : `${date}Z`);
    
    // Como a date-fns v3 não tem suporte nativo a IANA timezones de forma simples,
    // e o UTC-3 é fixo para America/Sao_Paulo na maior parte do ano (sem horário de verão),
    // vamos ajustar a data manualmente para refletir UTC-3, que é o que o toLocaleString faz.
    // Isso é uma aproximação e o ideal seria usar uma lib como date-fns-tz.
    const utcDate = new Date(dateObj.valueOf() + dateObj.getTimezoneOffset() * 60000);
    const saoPauloDate = new Date(utcDate.valueOf() - 3 * 60 * 60 * 1000);
    
    return format(saoPauloDate, formatStr, { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Data inválida';
  }
};


export const formatTimestampRelative = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = parseISO(timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (error) {
    console.error("Error formatting relative date:", error);
    return '';
  }
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return formatSaoPauloDate(timestamp, 'HH:mm');
};

export const formatDateHeader = (timestamp) => {
  if (!timestamp) return '';
  const dateObj = toDate(parseISO(timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`));
  const saoPauloDate = toSaoPauloTime(dateObj);

  const today = toSaoPauloTime(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (saoPauloDate.toDateString() === today.toDateString()) return 'Hoje';
  if (saoPauloDate.toDateString() === yesterday.toDateString()) return 'Ontem';
  
  return formatSaoPauloDate(dateObj, "dd 'de' MMMM 'de' yyyy");
};

export const formatFullDateTime = (timestamp) => {
  if (!timestamp) return '';
  return formatSaoPauloDate(timestamp, "dd 'de' MMMM 'de' yyyy, 'às' HH:mm");
};

export const formatChartDate = (timestamp) => {
  if (!timestamp) return '';
  return formatSaoPauloDate(timestamp, "MMM/yy");
};
