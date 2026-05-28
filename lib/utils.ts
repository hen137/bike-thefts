import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcNormalDistribution(x: number, mean: number, std: number) {
  const z = (x - mean) / std;
  const coeff = 1 / (std * Math.sqrt(2 * Math.PI));
  return coeff * Math.exp(-(z ** 2 / 2));
}

export function calcRawSliderToDates(
  sliderVals: number[],
  sliderRange: number,
  dateBounds: { lowerBound: Date; upperBound: Date }
) {
  const { lowerBound, upperBound } = dateBounds;

  const yearDelta = upperBound.getFullYear() - lowerBound.getFullYear();
  const monthDelta =
    upperBound.getMonth() - lowerBound.getMonth() + 12 * yearDelta;

  const startMonths = Math.floor((sliderVals[0] * monthDelta) / sliderRange);
  const endMonths = Math.floor((sliderVals[1] * monthDelta) / sliderRange);

  const startMonth = (lowerBound.getMonth() + startMonths) % 12;
  const startYear =
    lowerBound.getFullYear() +
    Math.floor((lowerBound.getMonth() + startMonths) / 12);

  const endMonth = (lowerBound.getMonth() + endMonths) % 12;
  const endYear =
    lowerBound.getFullYear() +
    Math.floor((lowerBound.getMonth() + endMonths) / 12);

  const startDate = { month: startMonth, year: startYear };
  const endDate = { month: endMonth, year: endYear };

  return { startDate, endDate };
}
