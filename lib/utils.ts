import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcNormalDistribution(x: number, mean: number, std: number) {
  const z = (x - mean) / std;
  const coeff = 1 / (std * Math.sqrt(2 * Math.PI));
  return coeff * Math.exp(-((z ^ 2) / 2));
}
