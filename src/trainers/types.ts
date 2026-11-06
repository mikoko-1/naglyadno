export type TrainerProps = {
  onStreakDelta?: (delta: number) => void;
  /** When omitted, reads initial preference from `localStorage` (same key as App). */
  soundOn?: boolean;
};
