export interface Wine {
  id: string;
  name: string;
  name_ge?: string;
  name_en?: string;
  name_ru?: string;
  type?: string;
  type_ge?: string;
  type_en?: string;
  type_ru?: string;
  oldPrice?: number;
  newPrice?: number;
  price?: number;
  img: string;
  stock?: number;
  description?: string;
  description_ge?: string;
  description_en?: string;
  description_ru?: string;
  isDiscounted?: boolean;
}

export type Lang = 'GE' | 'EN' | 'RU';

export function getWineName(wine: Wine, lang: Lang): string {
  if (lang === 'GE') return wine.name_ge || wine.name;
  if (lang === 'RU') return wine.name_ru || wine.name;
  return wine.name_en || wine.name;
}

export function getWineType(wine: Wine, lang: Lang): string {
  if (lang === 'GE') return wine.type_ge || wine.type || '';
  if (lang === 'RU') return wine.type_ru || wine.type || '';
  return wine.type_en || wine.type || '';
}
