export function formatDate(dateStr) {
  if (!dateStr) return 'Nije uneseno';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Nije uneseno';
  const day   = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getUTCFullYear()}`;
}

export function relativeDate(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Danas';
  if (diff === 1) return 'Juče';
  if (diff < 7)  return `Prije ${diff} dana`;
  if (diff < 30) return `Prije ${Math.floor(diff / 7)} sedm.`;
  return formatDate(dateStr);
}

export function trajanjeLabel(mj) {
  const n = Number(mj);
  if (mj === null || mj === undefined || isNaN(n)) return 'Trajanje nepoznato';
  if (n === 1) return '1 mjesec';
  if (n < 5)   return `${n} mjeseca`;
  return `${n} mjeseci`;
}

export function mjestLabel(n) {
  return n === 1 ? '1 mjesto' : `${n} mjesta`;
}

export function deadlineInfo(dateStr) {
  const days = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  if (days < 0)   return { label: 'Rok je istekao',                              cls: 'expired' };
  if (days === 0) return { label: 'Rok ističe danas!',                            cls: 'urgent'  };
  if (days <= 3)  return { label: `Ističe za ${days} dan${days === 1 ? '' : 'a'}!`, cls: 'urgent'  };
  if (days <= 7)  return { label: `Ističe za ${days} dana`,                       cls: 'soon'    };
  return           { label: `Još ${days} dana`,                                   cls: 'ok'      };
}
