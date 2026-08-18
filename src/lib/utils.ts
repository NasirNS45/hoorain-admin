import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPkr(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}
