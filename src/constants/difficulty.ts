export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';

export const difficultyLevels: Record<DifficultyLevel, number> = {
  easy: 38,
  normal: 30,
  hard: 23,
  expert: 17, // 17 is the minimum number of revealed cells for a sudoku to have a unique solution
};
