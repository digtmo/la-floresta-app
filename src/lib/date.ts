const monthMap: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
};

export function parseSpanishDate(raw: string): Date | null {
  const clean = raw.toLowerCase().replace(',', '').trim();
  const match = clean.match(/^(\d{1,2})\s+([a-záéíóú]+)\s+(\d{4})$/i);
  if (!match) return null;

  const day = Number(match[1]);
  const month = monthMap[match[2].normalize('NFD').replace(/\p{Diacritic}/gu, '')];
  const year = Number(match[3]);

  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;

  return new Date(year, month, day, 0, 0, 0, 0);
}

export function asIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
