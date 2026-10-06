import type { HabitColor } from '@/types/habit';

/** Accent per habit color: solid for icons/progress, soft for icon backgrounds (light, dark). */
export const habitColors: Record<HabitColor, { solid: string; soft: [string, string] }> = {
  blue: { solid: '#2F6BFF', soft: ['#EAF1FF', '#16234A'] },
  indigo: { solid: '#5B5FEF', soft: ['#EEEEFF', '#1E1F4A'] },
  green: { solid: '#22C55E', soft: ['#EAFBF0', '#0D2A18'] },
  orange: { solid: '#FF8A00', soft: ['#FFF3E5', '#3A2408'] },
  violet: { solid: '#8B5CF6', soft: ['#F3EEFF', '#24183F'] },
  pink: { solid: '#EC4899', soft: ['#FDECF5', '#3A1229'] },
  teal: { solid: '#14B8A6', soft: ['#E6F8F6', '#0B2A27'] },
};
