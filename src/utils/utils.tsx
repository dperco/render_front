export const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  let d: Date;
  if (typeof date === 'string') {
    const isoDate = date.split('T')[0];  
    const [year, month, day] = isoDate.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = date;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`; 
};



export const formatId = (id: number | string | null): string => {
  if (!id) return '';
  const digits = String(id).replace(/\D/g, '');
  return digits.replace(/^(\d{2})(\d{3})(\d{3}).*/, '$1.$2.$3');
}


export const formatPesoARS = (amount: number | string | null): string => {
  if (amount === null || amount === undefined || amount === '') return '';
  // Convertir a número (reemplaza coma decimal por punto si viene en string)
  const value =
    typeof amount === 'string'
      ? parseFloat(amount.replace(/\./g, '').replace(/,/g, '.'))
      : amount;

  if (isNaN(value)) return '';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
