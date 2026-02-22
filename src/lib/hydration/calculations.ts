export const DEFAULT_HYDRATION_FACTOR_ML_PER_KG = 35;

export function calculateDailyMl(weight: number, factor = DEFAULT_HYDRATION_FACTOR_ML_PER_KG): number {
  return weight * factor;
}

export function calculateGoal(weight: number, glassSize: number, factor = DEFAULT_HYDRATION_FACTOR_ML_PER_KG): number {
  return Math.round(calculateDailyMl(weight, factor) / glassSize);
}
