'use server';
import { createNewGame } from '@/dal/game';
import { NewGameInput, NewGameResponse } from '@/types';

export async function submitNewGame(data: NewGameInput): Promise<NewGameResponse> {
  const gameRes = await createNewGame(data);
  return gameRes;
}
