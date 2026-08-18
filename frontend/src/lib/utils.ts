export function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(value?: number | string) {
  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value ?? 0;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
}