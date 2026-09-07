export const PRACTICE_FILTERS = [
  { value: 'all', label: 'Sve prakse' },
  { value: 'active', label: 'Aktivne' },
  { value: 'upcoming', label: 'Nadolazeće' },
  { value: 'finished', label: 'Završene' },
];

export const PRACTICE_LIFECYCLE_LABELS = {
  NADOLAZECA: 'Nadolazeća praksa',
  AKTIVNA: 'Aktivna praksa',
  ZAVRSENA: 'Završena praksa',
  ODUSTAO: 'Odustao',
};

export function practiceLifecycleLabel(status) {
  return PRACTICE_LIFECYCLE_LABELS[status] || 'Praksa';
}

export function practiceLifecycleTone(status) {
  if (status === 'AKTIVNA') return 'active';
  if (status === 'NADOLAZECA') return 'pending';
  if (status === 'ZAVRSENA') return 'finished';
  return 'withdrawn';
}
