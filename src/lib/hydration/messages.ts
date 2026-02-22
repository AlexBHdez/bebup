export interface ProgressMessage {
  min: number;
  max: number;
  text: string;
  emoji: string;
}

export const PROGRESS_MESSAGES: ProgressMessage[] = [
  { min: 0, max: 0.2, text: "¡Empieza tu día con un vaso! 💧", emoji: "🌅" },
  { min: 0.2, max: 0.4, text: "¡Buen inicio! Sigue así 💪", emoji: "😊" },
  { min: 0.4, max: 0.6, text: "¡Vas por la mitad! Genial 🎯", emoji: "🚀" },
  { min: 0.6, max: 0.8, text: "¡Casi llegas! Un vasito más 💧", emoji: "✨" },
  { min: 0.8, max: 1.0, text: "¡Ya casi! Último esfuerzo 🏆", emoji: "💪" },
  { min: 1.0, max: Number.POSITIVE_INFINITY, text: "¡Meta cumplida! Increíble 🎉", emoji: "🏆" },
];

export function getProgressMessage(current: number, goal: number): ProgressMessage {
  const ratio = goal > 0 ? current / goal : 0;
  return PROGRESS_MESSAGES.find((message) => ratio >= message.min && ratio < message.max) ?? PROGRESS_MESSAGES[0];
}
