const pesosFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatPesos(value) {
  return pesosFormatter.format(Number(value ?? 0));
}