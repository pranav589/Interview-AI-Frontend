import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date) {
  try {
    return format(new Date(date), 'MMMM d, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
}
