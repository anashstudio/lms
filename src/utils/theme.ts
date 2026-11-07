import { ThemeColor } from '../types/models';

export interface ThemeStyles {
  primary: string;
  primaryHover: string;
  bgLight: string;
  textLight: string;
  borderLight: string;
  badge: string;
  gradient: string;
}

export const THEME_CONFIGS: Record<ThemeColor, ThemeStyles> = {
  emerald: {
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    gradient: 'from-emerald-600 to-teal-700'
  },
  blue: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-600 to-indigo-700'
  },
  indigo: {
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    borderLight: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    gradient: 'from-indigo-600 to-purple-700'
  },
  violet: {
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    bgLight: 'bg-violet-50',
    textLight: 'text-violet-700',
    borderLight: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800',
    gradient: 'from-violet-600 to-fuchsia-700'
  },
  amber: {
    primary: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-900',
    gradient: 'from-amber-600 to-orange-700'
  },
  slate: {
    primary: 'bg-slate-800',
    primaryHover: 'hover:bg-slate-900',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-800',
    borderLight: 'border-slate-300',
    badge: 'bg-slate-200 text-slate-800',
    gradient: 'from-slate-800 to-slate-950'
  }
};
