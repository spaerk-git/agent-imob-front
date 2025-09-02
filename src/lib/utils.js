import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  if (cleaned.length === 13) { // +5511987654321
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
  }
   if (cleaned.length === 12) { // 5511987654321
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})(\d{4})$/);
     if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
  }
  if (cleaned.length === 11) { // 11987654321
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  if (cleaned.length === 10) { // 1187654321
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }

  return phoneNumber;
}

export function formatPhoneNumberForInput(value) {
    if (!value) return "";
    const cleaned = ('' + value).replace(/\D/g, '');
    let formatted = '+';
    if (cleaned.length > 0) {
        formatted += cleaned.substring(0, 2);
    }
    if (cleaned.length > 2) {
        formatted += ` (${cleaned.substring(2, 4)}`;
    }
    if (cleaned.length > 4) {
        formatted += `) ${cleaned.substring(4, 9)}`;
    }
    if (cleaned.length > 9) {
        formatted += `-${cleaned.substring(9, 13)}`;
    }
    return formatted.substring(0, 19);
};

export function unmaskPhoneNumber(maskedValue) {
    if (!maskedValue) return "";
    return maskedValue.replace(/\D/g, '');
}
