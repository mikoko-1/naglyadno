import type { ComponentType } from 'react';
import { FractionsTrainer } from '../components/FractionsTrainer.tsx';
import type { TrainerProps } from './types.ts';

export type { TrainerProps };

export const TRAINERS: Record<string, ComponentType<TrainerProps>> = {
  'g5-fractions-common': FractionsTrainer,
};

export function getTrainer(topicId: string): ComponentType<TrainerProps> | undefined {
  return TRAINERS[topicId];
}
