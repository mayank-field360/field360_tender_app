import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

/** Merge class names (simple — no tailwind needed) */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Parse date that might be in DD-MM-YYYY format */
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // If it's DD-MM-YYYY or DD-MM-YYYY HH:mm etc
  if (typeof dateStr === "string" && dateStr.match(/^\d{2}-\d{2}-\d{4}/)) {
    const parts = dateStr.split(" ")[0].split("-");
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/** Format date for display */
export function formatDate(date: string | null | undefined): string {
  const d = parseDate(date);
  if (!d) return "N/A";
  return format(d, "dd MMM yyyy");
}

/** Format date with time */
export function formatDateTime(date: string | null | undefined): string {
  const d = parseDate(date);
  if (!d) return "N/A";
  return format(d, "dd MMM yyyy, hh:mm a");
}

/** Relative time */
export function timeAgo(date: string | null | undefined): string {
  const d = parseDate(date);
  if (!d) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Check if a tender deadline has passed */
export function isExpired(endDate: string | null | undefined): boolean {
  const d = parseDate(endDate);
  if (!d) return false;
  return isPast(d);
}

/** Days remaining until deadline */
export function daysRemaining(endDate: string | null | undefined): number {
  const d = parseDate(endDate);
  if (!d) return 0;
  return differenceInDays(d, new Date());
}

/** Format currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Get status color class */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "status-pending",
    SUBMITTED: "status-submitted",
    ACCEPTED: "status-accepted",
    REJECTED: "status-rejected",
    WITHDRAWN: "status-withdrawn",
  };
  return map[status] ?? "status-pending";
}
